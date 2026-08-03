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

const { bulkDeleteStaffs } = require('../src/modules/admin/staffs/controller');

function createTransaction() {
    return {
        finished: null,
        async commit() {
            this.finished = 'commit';
        },
        async rollback() {
            this.finished = 'rollback';
        }
    };
}

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

test('bulk delete removes a deduplicated staff selection in one transaction', async () => {
    const transaction = createTransaction();
    const calls = {};
    const auditLogs = [];
    const models = {
        Staff: {
            sequelize: { transaction: async () => transaction },
            async findAll(options) {
                calls.findAll = options;
                return [
                    { id: 'staff-1', companyId: 'company-1' },
                    { id: 'staff-2', companyId: 'company-1' }
                ];
            },
            async destroy(options) {
                calls.destroy = options;
                return 2;
            }
        },
        Company: {},
        AuditLog: {
            async create(payload) {
                auditLogs.push(payload);
                return payload;
            }
        }
    };
    const req = {
        models,
        body: {
            staffIds: ['staff-1', 'staff-2', 'staff-1'],
            companyId: 'company-1'
        },
        user: { id: 'admin-1', type: 'Admin' }
    };
    const res = createResponse();
    let nextError;

    await bulkDeleteStaffs(req, res, (error) => {
        nextError = error;
    });

    assert.equal(nextError, undefined);
    assert.equal(transaction.finished, 'commit');
    assert.equal(calls.findAll.where.companyId, 'company-1');
    assert.equal(calls.destroy.transaction, transaction);
    assert.deepEqual(res.result.payload.deletedIds, ['staff-1', 'staff-2']);
    assert.equal(res.result.payload.deletedCount, 2);
    assert.equal(res.result.payload.scope, 'selected');
    assert.equal(auditLogs[0].action, 'staff.bulk_delete');
    assert.equal(auditLogs[0].meta.deletedCount, 2);
});

test('company-wide bulk delete requires an exact company confirmation', async () => {
    let queried = false;
    const models = {
        Staff: {
            findAll: async () => {
                queried = true;
                return [];
            }
        },
        Company: {
            findByPk: async () => ({ id: 'company-1', name: 'Example Limited' })
        },
        AuditLog: { create: async (payload) => payload }
    };
    const req = {
        models,
        body: {
            companyId: 'company-1',
            deleteAllForCompany: true,
            confirmation: 'company-2'
        }
    };
    const res = createResponse();

    await bulkDeleteStaffs(req, res, () => {});

    assert.equal(res.result.status, 400);
    assert.match(res.result.message, /confirmation/i);
    assert.equal(queried, false);
});

test('company-wide bulk delete removes only staff resolved for that company', async () => {
    const transaction = createTransaction();
    const calls = {};
    const models = {
        Staff: {
            sequelize: { transaction: async () => transaction },
            async findAll(options) {
                calls.findAll = options;
                return [
                    { id: 'staff-1', companyId: 'company-1' },
                    { id: 'staff-2', companyId: 'company-1' }
                ];
            },
            async destroy(options) {
                calls.destroy = options;
                return 2;
            }
        },
        Company: {
            findByPk: async (id) => ({ id, name: 'Example Limited' })
        },
        AuditLog: { create: async (payload) => payload }
    };
    const req = {
        models,
        body: {
            companyId: 'company-1',
            deleteAllForCompany: true,
            confirmation: 'company-1'
        }
    };
    const res = createResponse();

    await bulkDeleteStaffs(req, res, () => {});

    assert.equal(transaction.finished, 'commit');
    assert.deepEqual(calls.findAll.where, { companyId: 'company-1' });
    assert.equal(calls.destroy.transaction, transaction);
    assert.equal(res.result.payload.scope, 'company');
    assert.equal(res.result.payload.companyId, 'company-1');
    assert.equal(res.result.payload.deletedCount, 2);
});

test('selected bulk delete fails atomically when any requested staff is missing', async () => {
    let destroyed = false;
    const models = {
        Staff: {
            findAll: async () => [{ id: 'staff-1', companyId: 'company-1' }],
            destroy: async () => {
                destroyed = true;
            }
        },
        Company: {},
        AuditLog: { create: async (payload) => payload }
    };
    const req = {
        models,
        body: { staffIds: ['staff-1', 'staff-2'] }
    };
    const res = createResponse();

    await bulkDeleteStaffs(req, res, () => {});

    assert.equal(res.result.status, 409);
    assert.match(res.result.message, /no longer exist/i);
    assert.equal(destroyed, false);
});
