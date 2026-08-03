'use strict';

const assert = require('node:assert/strict');
const test = require('node:test');

const {
    syncBenefitCategories,
    syncBenefits
} = require('../src/modules/admin/plans/controller');

function createTransaction() {
    return {
        LOCK: { UPDATE: 'UPDATE' },
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

test('benefit-category sync is atomic, deduplicates input, and removes benefits from deselected categories', async () => {
    const transaction = createTransaction();
    const calls = {};
    let planLookupCount = 0;
    const updatedPlan = {
        id: 'plan-1',
        benefitCategories: [{ id: 'category-1' }],
        benefits: [{ id: 'benefit-1', benefitCategoryId: 'category-1' }]
    };
    const models = {
        Plan: {
            sequelize: { transaction: async () => transaction },
            async findByPk(id, options) {
                planLookupCount += 1;
                calls[`planLookup${planLookupCount}`] = { id, options };
                if (planLookupCount === 1) return { id, name: 'Standard Plan' };
                return { toJSON: () => updatedPlan };
            }
        },
        BenefitCategory: {
            async findAll(options) {
                calls.categoryValidation = options;
                return [{ id: 'category-1' }];
            }
        },
        Benefit: {
            async findAll(options) {
                calls.allowedBenefits = options;
                return [{ id: 'benefit-1' }];
            }
        },
        PlanBenefitCategory: {
            async findAll(options) {
                calls.currentCategories = options;
                return [
                    { benefitCategoryId: 'category-1' },
                    { benefitCategoryId: 'category-old' }
                ];
            },
            async destroy(options) {
                calls.categoryDestroy = options;
                return 2;
            },
            async bulkCreate(records, options) {
                calls.categoryCreate = { records, options };
                return records;
            }
        },
        PlanBenefit: {
            async destroy(options) {
                calls.benefitDestroy = options;
                return 1;
            }
        },
        AuditLog: { create: async payload => payload }
    };
    const req = {
        models,
        params: { id: 'plan-1' },
        body: { benefitCategoryIds: ['category-1', 'category-1'] },
        user: { id: 'admin-1', type: 'Admin' }
    };
    const res = createResponse();
    let nextError;

    await syncBenefitCategories(req, res, error => {
        nextError = error;
    });

    assert.equal(nextError, undefined);
    assert.equal(transaction.finished, 'commit');
    assert.equal(calls.planLookup1.options.lock, 'UPDATE');
    assert.deepEqual(calls.categoryCreate.records, [
        { planId: 'plan-1', benefitCategoryId: 'category-1' }
    ]);
    assert.equal(calls.categoryDestroy.transaction, transaction);
    assert.equal(calls.benefitDestroy.transaction, transaction);
    assert.deepEqual(res.result.payload.plan, updatedPlan);
});

test('benefit-category sync rejects an invalid category without changing the plan', async () => {
    const transaction = createTransaction();
    let destroyed = false;
    const models = {
        Plan: {
            sequelize: { transaction: async () => transaction },
            findByPk: async () => ({ id: 'plan-1', name: 'Standard Plan' })
        },
        BenefitCategory: { findAll: async () => [] },
        Benefit: {},
        PlanBenefitCategory: {
            destroy: async () => {
                destroyed = true;
            }
        },
        PlanBenefit: {},
        AuditLog: { create: async payload => payload }
    };
    const req = {
        models,
        params: { id: 'plan-1' },
        body: { benefitCategoryIds: ['missing-category'] }
    };
    const res = createResponse();

    await syncBenefitCategories(req, res, () => {});

    assert.equal(res.result.status, 400);
    assert.match(res.result.message, /do not exist/i);
    assert.equal(transaction.finished, 'rollback');
    assert.equal(destroyed, false);
});

test('deselecting every benefit category removes every plan benefit and category join', async () => {
    const transaction = createTransaction();
    const calls = {};
    let planLookupCount = 0;
    const models = {
        Plan: {
            sequelize: { transaction: async () => transaction },
            async findByPk() {
                planLookupCount += 1;
                if (planLookupCount === 1) return { id: 'plan-1', name: 'Standard Plan' };
                return {
                    toJSON: () => ({
                        id: 'plan-1',
                        benefitCategories: [],
                        benefits: []
                    })
                };
            }
        },
        BenefitCategory: {
            findAll: async () => {
                throw new Error('empty selections should not need category validation');
            }
        },
        Benefit: {
            findAll: async () => {
                throw new Error('empty selections should not need a benefit lookup');
            }
        },
        PlanBenefitCategory: {
            findAll: async () => [{ benefitCategoryId: 'category-1' }],
            async destroy(options) {
                calls.categoryDestroy = options;
                return 1;
            },
            bulkCreate: async () => {
                throw new Error('empty selections should not create category joins');
            }
        },
        PlanBenefit: {
            async destroy(options) {
                calls.benefitDestroy = options;
                return 2;
            }
        },
        AuditLog: { create: async payload => payload }
    };
    const req = {
        models,
        params: { id: 'plan-1' },
        body: { benefitCategoryIds: [] }
    };
    const res = createResponse();

    await syncBenefitCategories(req, res, () => {});

    assert.equal(transaction.finished, 'commit');
    assert.deepEqual(calls.benefitDestroy.where, { planId: 'plan-1' });
    assert.deepEqual(calls.categoryDestroy.where, { planId: 'plan-1' });
    assert.deepEqual(res.result.payload.plan.benefitCategories, []);
    assert.deepEqual(res.result.payload.plan.benefits, []);
});

test('benefit sync replaces only the selected category benefits in one transaction', async () => {
    const transaction = createTransaction();
    const calls = {};
    const models = {
        Plan: {
            sequelize: { transaction: async () => transaction },
            findByPk: async () => ({ id: 'plan-1', name: 'Standard Plan' })
        },
        BenefitCategory: {
            findByPk: async () => ({ id: 'category-1', name: 'Dental' })
        },
        Benefit: {
            findAll: async () => [{ id: 'benefit-1' }, { id: 'benefit-2' }]
        },
        PlanBenefitCategory: {
            findOne: async () => ({ planId: 'plan-1', benefitCategoryId: 'category-1' })
        },
        PlanBenefit: {
            async destroy(options) {
                calls.destroy = options;
                return 2;
            },
            async bulkCreate(records, options) {
                calls.create = { records, options };
                return records;
            }
        },
        AuditLog: { create: async payload => payload }
    };
    const req = {
        models,
        params: { planId: 'plan-1', benefitCategoryId: 'category-1' },
        body: { benefitIds: ['benefit-2', 'benefit-2'] }
    };
    const res = createResponse();

    await syncBenefits(req, res, () => {});

    assert.equal(transaction.finished, 'commit');
    assert.equal(calls.destroy.transaction, transaction);
    assert.deepEqual(calls.create.records, [
        { planId: 'plan-1', benefitId: 'benefit-2' }
    ]);
    assert.deepEqual(res.result.payload.benefitIds, ['benefit-2']);
});

test('benefit sync rolls back when writing the replacement selection fails', async () => {
    const transaction = createTransaction();
    const writeError = new Error('database write failed');
    const models = {
        Plan: {
            sequelize: { transaction: async () => transaction },
            findByPk: async () => ({ id: 'plan-1', name: 'Standard Plan' })
        },
        BenefitCategory: { findByPk: async () => ({ id: 'category-1' }) },
        Benefit: { findAll: async () => [{ id: 'benefit-1' }] },
        PlanBenefitCategory: { findOne: async () => ({ id: 'join-1' }) },
        PlanBenefit: {
            destroy: async () => 1,
            bulkCreate: async () => {
                throw writeError;
            }
        },
        AuditLog: { create: async payload => payload }
    };
    const req = {
        models,
        params: { planId: 'plan-1', benefitCategoryId: 'category-1' },
        body: { benefitIds: ['benefit-1'] }
    };
    const res = createResponse();
    let nextError;

    await syncBenefits(req, res, error => {
        nextError = error;
    });

    assert.equal(nextError, writeError);
    assert.equal(transaction.finished, 'rollback');
    assert.equal(res.result.status, undefined);
});
