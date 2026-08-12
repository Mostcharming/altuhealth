'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');

const authorizationCodesController = require('../src/modules/provider/authorizationCodes/controller');

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

test('provider authorization-code list is scoped to the authenticated provider', async () => {
    const calls = {};
    const row = {
        toJSON() {
            return { id: 'auth-1', providerId: 'provider-1' };
        }
    };
    const models = {
        AuthorizationCode: {
            async count(options) {
                calls.count = options;
                return 1;
            },
            async findAll(options) {
                calls.findAll = options;
                return [row];
            }
        },
        Enrollee: {},
        Provider: {},
        Diagnosis: {},
        Company: {},
        CompanyPlan: {},
        Admin: {}
    };
    const req = {
        user: { id: 'provider-1', type: 'Provider' },
        query: {
            providerId: 'provider-2',
            page: '2',
            limit: '10',
            status: 'active'
        },
        models
    };
    const res = makeResponse();
    let nextError;

    await authorizationCodesController.listAuthorizationCodes(req, res, (error) => {
        nextError = error;
    });

    assert.equal(nextError, undefined);
    assert.deepEqual(calls.count.where, {
        providerId: 'provider-1',
        status: 'active'
    });
    assert.strictEqual(calls.findAll.where, calls.count.where);
    assert.equal(calls.findAll.limit, 10);
    assert.equal(calls.findAll.offset, 10);
    assert.deepEqual(res.result.data.list, [
        { id: 'auth-1', providerId: 'provider-1' }
    ]);
    assert.equal(res.result.data.count, 1);
});
