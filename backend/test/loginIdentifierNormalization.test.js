'use strict';

const assert = require('node:assert/strict');
const test = require('node:test');
const Sequelize = require('sequelize');

const { login: adminLogin } = require('../src/modules/admin/auth/controller');
const { enrolleeLogin } = require('../src/modules/enrollee/auth/enrolleeLogin.controller');
const { providerLogin } = require('../src/modules/provider/auth/providerLogin.controller');
const { login: referrerLogin } = require('../src/modules/referrer/auth/controller');
const {
    normalizeEmailIdentifier,
    normalizePolicyIdentifier,
    removeIdentifierWhitespace
} = require('../src/utils/loginIdentifier');

function createResponse() {
    const result = {};
    return {
        result,
        success(payload, message) {
            result.status = 200;
            result.payload = payload;
            result.message = message;
            return result;
        },
        fail(message, status) {
            result.status = status;
            result.message = message;
            return result;
        }
    };
}

test('login identifier helpers remove all whitespace without changing passwords', () => {
    assert.equal(normalizeEmailIdentifier('  User @Example.com\t'), 'user@example.com');
    assert.equal(normalizePolicyIdentifier(' alt - 001\n'), 'ALT-001');
    assert.equal(removeIdentifierWhitespace('080 123 4567'), '0801234567');
    assert.equal(normalizeEmailIdentifier('   '), '');
});

test('admin login checks a whitespace-free, case-normalized email', async () => {
    let lookup;
    const req = {
        body: { email: ' Admin @Example.com ', password: 'unchanged password' },
        models: {
            Admin: {
                async findOne(options) {
                    lookup = options.where;
                    return null;
                }
            }
        }
    };
    const res = createResponse();

    await adminLogin(req, res, () => {});

    assert.equal(lookup.logic, 'admin@example.com');
    assert.equal(res.result.status, 401);
});

test('enrollee login normalizes spaced emails for corporate and retail lookups', async () => {
    const lookups = [];
    const makeModel = () => ({
        async findOne(options) {
            lookups.push(options.where);
            return null;
        }
    });
    const req = {
        body: { email: ' Member @Example.com ', password: 'unchanged password' },
        models: {
            Enrollee: makeModel(),
            RetailEnrollee: makeModel()
        }
    };
    const res = createResponse();

    await enrolleeLogin(req, res, () => {});

    assert.deepEqual(lookups.map(where => where.logic), [
        'member@example.com',
        'member@example.com'
    ]);
    assert.equal(res.result.status, 401);
});

test('provider login removes whitespace before checking email and UPN', async () => {
    const lookups = [];
    const req = {
        body: { policyNumber: ' pro - 001 ', password: 'unchanged password' },
        models: {
            Provider: {
                async findOne(options) {
                    lookups.push(options.where);
                    return null;
                }
            }
        }
    };
    const res = createResponse();

    await providerLogin(req, res, () => {});

    assert.equal(lookups[0].logic, 'pro-001');
    assert.deepEqual(lookups[1], { upn: 'PRO-001' });
    assert.equal(res.result.status, 401);
});

test('referral login removes whitespace before checking email', async () => {
    let lookup;
    const req = {
        body: { email: ' Referrer @Example.com ', password: 'unchanged password' },
        models: {
            Referrer: {
                async findOne(options) {
                    lookup = options.where[Sequelize.Op.and];
                    return null;
                }
            }
        }
    };
    const res = createResponse();

    await referrerLogin(req, res, () => {});

    assert.equal(lookup.logic, 'referrer@example.com');
    assert.equal(res.result.status, 401);
});

test('policy-number login removes whitespace and uppercases before lookup', async () => {
    let lookup;
    const req = {
        body: { policyNumber: ' alt - 001 ', password: 'unchanged password' },
        models: {
            Admin: {},
            PolicyNumber: {
                async findOne(options) {
                    lookup = options.where.policyNumber;
                    return null;
                }
            }
        }
    };
    const res = createResponse();

    await adminLogin(req, res, () => {});

    assert.equal(lookup, 'ALT-001');
    assert.equal(res.result.status, 401);
});
