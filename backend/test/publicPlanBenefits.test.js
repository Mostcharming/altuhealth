'use strict';

const assert = require('node:assert/strict');
const test = require('node:test');

const {
    getPublicPlanBenefits
} = require('../src/modules/public/plans/controller');

function record(data) {
    return {
        ...data,
        toJSON() {
            return { ...data };
        }
    };
}

function createResponse() {
    const result = {};
    return {
        result,
        success(data, message, status = 200) {
            Object.assign(result, { ok: true, data, message, status });
            return result;
        },
        fail(message, status = 400, data = null) {
            Object.assign(result, { ok: false, data, message, status });
            return result;
        }
    };
}

test('public plan benefits are read from selected benefit rows and grouped by category', async () => {
    const req = {
        params: { id: 'plan-1' },
        models: {
            Plan: {
                findOne: async () => record({
                    id: 'plan-1',
                    name: 'Vital Plus',
                    code: 'VITAL_PLUS',
                    description: 'Extended healthcare coverage'
                })
            },
            PlanBenefitCategory: {
                findAll: async () => [
                    record({ benefitCategoryId: 'category-1' }),
                    record({ benefitCategoryId: 'category-2' })
                ]
            },
            PlanBenefit: {
                findAll: async () => [
                    record({ benefitId: 'benefit-1' }),
                    record({ benefitId: 'benefit-2' })
                ]
            },
            BenefitCategory: {
                findAll: async () => [
                    record({ id: 'category-1', name: 'Outpatient Care' }),
                    record({ id: 'category-2', name: 'Dental Care' })
                ]
            },
            Benefit: {
                findAll: async () => [
                    record({
                        id: 'benefit-1',
                        name: 'General consultation',
                        description: 'Consultations with a general practitioner.',
                        isCovered: true,
                        coverageType: 'unlimited',
                        coverageValue: null,
                        benefitCategoryId: 'category-1'
                    }),
                    record({
                        id: 'benefit-2',
                        name: 'Specialist consultation',
                        description: 'Specialist visits with a referral.',
                        isCovered: false,
                        coverageType: 'times_per_year',
                        coverageValue: '2',
                        benefitCategoryId: 'category-1'
                    })
                ]
            }
        }
    };
    const res = createResponse();

    await getPublicPlanBenefits(req, res, error => {
        throw error;
    });

    assert.equal(res.result.ok, true);
    assert.deepEqual(res.result.data.summary, {
        categoryCount: 2,
        benefitCount: 2,
        coveredBenefitCount: 1
    });
    assert.equal(res.result.data.categories[0].benefitCount, 2);
    assert.equal(res.result.data.categories[1].benefitCount, 0);
    assert.equal(
        res.result.data.categories[0].benefits[1].coverageValue,
        '2'
    );
});

test('public plan benefits are unavailable for a missing or unpublished plan', async () => {
    const req = {
        params: { id: 'missing-plan' },
        models: {
            Plan: { findOne: async () => null }
        }
    };
    const res = createResponse();

    await getPublicPlanBenefits(req, res, error => {
        throw error;
    });

    assert.equal(res.result.ok, false);
    assert.equal(res.result.status, 404);
    assert.equal(res.result.message, 'Plan not found');
});
