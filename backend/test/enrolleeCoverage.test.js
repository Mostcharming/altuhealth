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

const {
    getEnrollees,
    getEnrolleeById
} = require('../src/modules/admin/enrollees/controller');

function createResponse() {
    const result = {};

    return {
        result,
        res: {
            success(payload, message) {
                result.payload = payload;
                result.message = message;
                return result;
            },
            fail(message, status) {
                throw new Error(`${status}: ${message}`);
            }
        }
    };
}

test('enrollee list filters by company plan and the staff subscription', async () => {
    let queryOptions;
    const models = {
        Enrollee: {
            async findAndCountAll(options) {
                queryOptions = options;
                return { count: 1, rows: [{ id: 'enrollee-1' }] };
            }
        },
        Staff: {},
        Company: {},
        CompanyPlan: {},
        Subscription: {}
    };
    const req = {
        models,
        query: {
            page: '1',
            limit: '10',
            isActive: 'all',
            companyPlanId: 'company-plan-1',
            subscriptionId: 'subscription-1'
        }
    };
    const { res, result } = createResponse();
    let nextError;

    await getEnrollees(req, res, (error) => {
        nextError = error;
    });

    assert.equal(nextError, undefined);
    assert.equal(queryOptions.where.companyPlanId, 'company-plan-1');

    const staffInclude = queryOptions.include.find(
        (include) => include.model === models.Staff
    );
    assert.equal(staffInclude.required, true);
    assert.deepEqual(staffInclude.where, { subscriptionId: 'subscription-1' });
    assert.equal(staffInclude.include[0].model, models.Subscription);
    assert.equal(queryOptions.distinct, true);
    assert.equal(result.payload.pagination.total, 1);
});

test('single enrollee data includes its company plan and staff subscription coverage', async () => {
    let findOptions;
    const enrollee = { id: 'enrollee-1' };
    const models = {
        Enrollee: {
            async findByPk(id, options) {
                assert.equal(id, 'enrollee-1');
                findOptions = options;
                return enrollee;
            }
        },
        Staff: {},
        Company: {},
        CompanyPlan: {},
        Subscription: {},
        EnrolleeMedicalHistory: {},
        AuthorizationCode: {},
        Provider: {},
        Diagnosis: {}
    };
    const req = {
        models,
        params: { enrolleeId: 'enrollee-1' }
    };
    const { res, result } = createResponse();
    let nextError;

    await getEnrolleeById(req, res, (error) => {
        nextError = error;
    });

    assert.equal(nextError, undefined);

    const staffInclude = findOptions.include.find(
        (include) => include.model === models.Staff
    );
    assert.equal(staffInclude.include[0].model, models.Subscription);
    assert.ok(staffInclude.include[0].attributes.includes('endDate'));

    const planInclude = findOptions.include.find(
        (include) => include.as === 'companyPlan'
    );
    assert.equal(planInclude.model, models.CompanyPlan);
    assert.ok(planInclude.attributes.includes('planCycle'));
    assert.equal(result.payload.enrollee, enrollee);
});
