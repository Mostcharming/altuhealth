'use strict';

const assert = require('node:assert/strict');
const test = require('node:test');

const {
    getEnrolleeBenefits
} = require('../src/modules/enrollee/benefits/controller');

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

test('enrollee benefit list preserves the covered flag returned by Sequelize', async () => {
    const models = {
        Enrollee: {
            findByPk: async () => ({
                id: 'enrollee-1',
                companyPlan: {
                    id: 'company-plan-1',
                    name: 'Standard Plan',
                    planType: 'standard',
                    planId: 'plan-1',
                    currency: 'NGN'
                }
            })
        },
        CompanyPlan: {},
        Plan: {},
        PlanBenefit: {
            findAll: async () => [{ benefitId: 'benefit-1' }]
        },
        CompanyPlanBenefit: {},
        Benefit: {
            count: async () => 1,
            findAll: async () => [{
                id: 'benefit-1',
                name: 'Dental Care',
                benefitCategoryId: 'category-1',
                'benefitCategory.name': 'Dental',
                isCovered: true,
                description: null,
                createdAt: new Date('2026-01-01T00:00:00.000Z'),
                updatedAt: new Date('2026-01-02T00:00:00.000Z')
            }]
        },
        BenefitCategory: {}
    };
    const req = {
        models,
        user: { id: 'enrollee-1' },
        query: { page: '1', limit: '10' }
    };
    const res = createResponse();
    let nextError;

    await getEnrolleeBenefits(req, res, error => {
        nextError = error;
    });

    assert.equal(nextError, undefined);
    assert.equal(res.result.status, 200);
    assert.equal(res.result.payload.benefits[0].isCovered, true);
    assert.equal(res.result.payload.benefits[0].description, undefined);
    assert.equal(res.result.payload.benefits[0].benefitCategory, 'Dental');
});
