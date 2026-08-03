'use strict';

const assert = require('node:assert/strict');
const test = require('node:test');
const bcrypt = require('bcrypt');
const { Op } = require('sequelize');

let notifyImplementation = async () => ({ email: true });
let generatedCodes = ['123456'];

const notifyModulePath = require.resolve('../src/utils/notify');
require.cache[notifyModulePath] = {
    id: notifyModulePath,
    filename: notifyModulePath,
    loaded: true,
    exports: (...args) => notifyImplementation(...args)
};

const verificationCodeModulePath = require.resolve('../src/utils/verificationCode');
require.cache[verificationCodeModulePath] = {
    id: verificationCodeModulePath,
    filename: verificationCodeModulePath,
    loaded: true,
    exports: () => generatedCodes.shift() || '654321'
};

delete require.cache[require.resolve('../src/modules/enrollee/auth/controller')];
const enrolleeAuthController = require('../src/modules/enrollee/auth/controller');

function makeResponse() {
    return {
        result: null,
        success(data, message, status = 200) {
            this.result = { ok: true, data, message, status };
            return this.result;
        },
        fail(message, status = 400, data = null) {
            this.result = { ok: false, data, message, status };
            return this.result;
        }
    };
}

function makeNext() {
    const state = { error: null };
    state.handler = (error) => {
        state.error = error;
    };
    return state;
}

test('forgot password creates an enrollee code and sends it by email', async () => {
    generatedCodes = ['123456'];
    const user = { id: 'enrollee-1', email: 'member@example.com' };
    let invalidatedWhere;
    let createdPayload;
    let notification;

    notifyImplementation = async (...args) => {
        notification = args;
        return { email: true };
    };

    const req = {
        body: { email: 'MEMBER@example.com' },
        models: {
            Enrollee: { findOne: async () => user },
            RetailEnrollee: { findOne: async () => null },
            PasswordReset: {
                async update(_payload, options) {
                    invalidatedWhere = options.where;
                },
                async findOne() {
                    return null;
                },
                async create(payload) {
                    createdPayload = payload;
                    return { destroy: async () => {} };
                }
            }
        }
    };
    const res = makeResponse();
    const next = makeNext();

    await enrolleeAuthController.forgot(req, res, next.handler);

    assert.equal(next.error, null);
    assert.deepEqual(invalidatedWhere, {
        userId: 'enrollee-1',
        userType: 'Enrollee',
        isUsed: false
    });
    assert.deepEqual(createdPayload, {
        userId: 'enrollee-1',
        userType: 'Enrollee',
        token: '123456'
    });
    assert.deepEqual(notification, [
        user,
        'Enrollee',
        'OTP',
        { code: '123456' },
        ['email'],
        true
    ]);
    assert.equal(res.result.ok, true);
    assert.equal(res.result.message, 'Verification code sent');
});

test('forgot password reports email delivery failures and removes the unusable code', async () => {
    generatedCodes = ['234567'];
    let destroyed = false;
    notifyImplementation = async () => ({ email: false });

    const req = {
        body: { policyNumber: 'ALT-001' },
        models: {
            Enrollee: {
                findOne: async () => ({ id: 'enrollee-2', email: 'member@example.com' })
            },
            RetailEnrollee: { findOne: async () => null },
            PasswordReset: {
                update: async () => {},
                findOne: async () => null,
                async create() {
                    return {
                        async destroy() {
                            destroyed = true;
                        }
                    };
                }
            }
        }
    };
    const res = makeResponse();
    const next = makeNext();
    const originalConsoleError = console.error;
    console.error = () => {};

    try {
        await enrolleeAuthController.forgot(req, res, next.handler);
    } finally {
        console.error = originalConsoleError;
    }

    assert.equal(next.error, null);
    assert.equal(destroyed, true);
    assert.equal(res.result.ok, false);
    assert.equal(res.result.status, 502);
    assert.match(res.result.message, /Unable to send verification code/);
});

test('reset password accepts a current retail enrollee code exactly once', async () => {
    const passwordUpdates = [];
    const tokenUpdates = [];
    let resetQuery;
    const resetEntry = {
        userId: 'retail-1',
        userType: 'RetailEnrollee',
        async update(payload) {
            tokenUpdates.push(payload);
        }
    };
    const user = {
        id: 'retail-1',
        async update(payload) {
            passwordUpdates.push(payload);
        }
    };
    const req = {
        body: { token: ' 345678 ', password: 'new-password' },
        models: {
            Enrollee: {},
            RetailEnrollee: {
                getAttributes: () => ({ password: {} }),
                findByPk: async (id) => {
                    assert.equal(id, 'retail-1');
                    return user;
                }
            },
            PasswordReset: {
                async findOne(options) {
                    resetQuery = options;
                    return resetEntry;
                }
            }
        }
    };
    const res = makeResponse();
    const next = makeNext();

    await enrolleeAuthController.reset(req, res, next.handler);

    assert.equal(next.error, null);
    assert.equal(resetQuery.where.token, '345678');
    assert.equal(resetQuery.where.isUsed, false);
    assert.ok(resetQuery.where.createdAt[Op.gte] instanceof Date);
    assert.deepEqual(resetQuery.order, [['createdAt', 'DESC']]);
    assert.equal(passwordUpdates.length, 1);
    assert.equal(await bcrypt.compare('new-password', passwordUpdates[0].password), true);
    assert.deepEqual(tokenUpdates, [{ isUsed: true }]);
    assert.equal(res.result.ok, true);
    assert.equal(res.result.message, 'Password has been reset');
});

test('reset password rejects expired, used, or non-enrollee codes', async (t) => {
    await t.test('expired or used code', async () => {
        const req = {
            body: { token: '456789', password: 'new-password' },
            models: {
                Enrollee: {},
                RetailEnrollee: {},
                PasswordReset: { findOne: async () => null }
            }
        };
        const res = makeResponse();

        await enrolleeAuthController.reset(req, res, (error) => {
            throw error;
        });

        assert.equal(res.result.ok, false);
        assert.equal(res.result.status, 401);
        assert.match(res.result.message, /expired/);
    });

    await t.test('code owned by another account type', async () => {
        let adminLookupAttempted = false;
        const req = {
            body: { token: '567890', password: 'new-password' },
            models: {
                Enrollee: {},
                RetailEnrollee: {},
                Admin: {
                    async findByPk() {
                        adminLookupAttempted = true;
                    }
                },
                PasswordReset: {
                    findOne: async () => ({
                        userId: 'admin-1',
                        userType: 'Admin'
                    })
                }
            }
        };
        const res = makeResponse();

        await enrolleeAuthController.reset(req, res, (error) => {
            throw error;
        });

        assert.equal(adminLookupAttempted, false);
        assert.equal(res.result.ok, false);
        assert.equal(res.result.status, 401);
    });
});
