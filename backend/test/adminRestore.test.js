'use strict';

const assert = require('node:assert/strict');
const test = require('node:test');

const notifyModulePath = require.resolve('../src/utils/notify');
require.cache[notifyModulePath] = {
    id: notifyModulePath,
    filename: notifyModulePath,
    loaded: true,
    exports: async () => {}
};

const { createAdmin } = require('../src/modules/admin/admins/controller');

function createResponse() {
    const result = {};
    return {
        result,
        success(payload, message, status = 200) {
            Object.assign(result, { payload, message, status });
            return result;
        },
        fail(message, status) {
            Object.assign(result, { message, status });
            return result;
        }
    };
}

function createModels(overrides = {}) {
    const transaction = { id: 'transaction-1' };
    const auditLogs = [];
    const notifications = [];
    const models = {
        Admin: {
            sequelize: {
                async transaction(callback) {
                    return callback(transaction);
                }
            }
        },
        UserRole: {
            async create() {},
            async destroy() {}
        },
        UserUnit: {
            async create() {},
            async destroy() {}
        },
        Role: { async findByPk() { return null; } },
        Unit: { async findByPk() { return null; } },
        AuditLog: {
            async create(payload) {
                auditLogs.push(payload);
                return payload;
            }
        },
        AdminNotification: {
            async create(payload) {
                notifications.push(payload);
                return payload;
            }
        },
        ...overrides
    };

    return { models, transaction, auditLogs, notifications };
}

test('creating an admin restores a soft-deleted account with fresh assignments', async () => {
    const calls = {};
    const deletedAdmin = {
        id: 'admin-1',
        isDeleted: true,
        email: 'old@example.com',
        async update(values, options) {
            calls.update = { values, options };
            Object.assign(this, values);
        }
    };
    const UserRole = {
        async destroy(options) { calls.roleDestroy = options; },
        async create(values, options) { calls.roleCreate = { values, options }; }
    };
    const UserUnit = {
        async destroy(options) { calls.unitDestroy = options; },
        async create(values, options) { calls.unitCreate = { values, options }; }
    };
    const Admin = {
        sequelize: {
            async transaction(callback) {
                return callback(transaction);
            }
        },
        async findOne(options) {
            calls.findOne = options;
            return deletedAdmin;
        },
        async create() {
            assert.fail('a second admin row must not be created');
        }
    };
    const transaction = { id: 'transaction-restore' };
    const { models, auditLogs } = createModels({
        Admin,
        UserRole,
        UserUnit,
        Role: { async findByPk(id, options) { calls.roleLookup = { id, options }; return { id }; } },
        Unit: { async findByPk(id, options) { calls.unitLookup = { id, options }; return { id }; } }
    });
    const req = {
        models,
        body: {
            firstName: 'Ada',
            lastName: 'Okafor',
            email: '  OLD@EXAMPLE.COM ',
            password: 'new-password',
            phoneNumber: '08000000000',
            roleId: 'role-1',
            unitId: 'unit-1'
        }
    };
    const res = createResponse();
    let nextError;

    await createAdmin(req, res, (error) => { nextError = error; });

    assert.equal(nextError, undefined);
    assert.equal(calls.findOne.transaction, transaction);
    assert.equal(calls.findOne.lock, true);
    assert.equal(calls.update.values.email, 'old@example.com');
    assert.equal(calls.update.values.isDeleted, false);
    assert.equal(calls.update.values.status, 'active');
    assert.notEqual(calls.update.values.passwordHash, 'new-password');
    assert.equal(calls.update.options.transaction, transaction);
    assert.equal(calls.roleDestroy.transaction, transaction);
    assert.equal(calls.unitDestroy.transaction, transaction);
    assert.deepEqual(calls.roleCreate.values, { userId: 'admin-1', userType: 'Admin', roleId: 'role-1' });
    assert.deepEqual(calls.unitCreate.values, { userId: 'admin-1', userType: 'Admin', unitId: 'unit-1' });
    assert.equal(auditLogs[0].action, 'admin.restore');
    assert.deepEqual(res.result.payload, { id: 'admin-1', restored: true });
    assert.equal(res.result.message, 'Admin restored');
    assert.equal(res.result.status, 201);
});

test('creating an admin still rejects an email used by an active account', async () => {
    let created = false;
    const { models } = createModels({
        Admin: {
            sequelize: {
                async transaction(callback) {
                    return callback({ id: 'transaction-conflict' });
                }
            },
            async findOne() {
                return { id: 'admin-1', isDeleted: false };
            },
            async create() {
                created = true;
            }
        }
    });
    const req = {
        models,
        body: { firstName: 'Ada', lastName: 'Okafor', email: 'ada@example.com', password: 'password' }
    };
    const res = createResponse();

    await createAdmin(req, res, () => {});

    assert.equal(created, false);
    assert.equal(res.result.status, 400);
    assert.equal(res.result.message, 'Email already in use');
});

test('a new admin and its assignments are created in the same transaction', async () => {
    const calls = {};
    const transaction = { id: 'transaction-create' };
    const admin = { id: 'admin-new', firstName: 'Ada', lastName: 'Okafor', email: 'ada@example.com' };
    const { models } = createModels({
        Admin: {
            sequelize: { async transaction(callback) { return callback(transaction); } },
            async findOne() { return null; },
            async create(values, options) {
                calls.adminCreate = { values, options };
                return admin;
            }
        },
        UserRole: {
            async destroy() {},
            async create(values, options) { calls.roleCreate = { values, options }; }
        },
        Role: { async findByPk() { return { id: 'role-1' }; } }
    });
    const req = {
        models,
        body: { firstName: 'Ada', lastName: 'Okafor', email: 'Ada@Example.com', password: 'password', roleId: 'role-1' }
    };
    const res = createResponse();

    await createAdmin(req, res, () => {});

    assert.equal(calls.adminCreate.values.email, 'ada@example.com');
    assert.equal(calls.adminCreate.options.transaction, transaction);
    assert.equal(calls.roleCreate.options.transaction, transaction);
    assert.deepEqual(res.result.payload, { id: 'admin-new', restored: false });
    assert.equal(res.result.message, 'Admin created');
});
