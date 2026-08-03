'use strict';

const assert = require('node:assert/strict');
const test = require('node:test');

const notifyCalls = [];
const notifyModulePath = require.resolve('../src/utils/notify');
require.cache[notifyModulePath] = {
    id: notifyModulePath,
    filename: notifyModulePath,
    loaded: true,
    exports: async (...args) => {
        notifyCalls.push(args);
    }
};

const {
    bulkResendEnrollmentNotifications
} = require('../src/modules/admin/enrollees/controller');

function createEnrollee(values) {
    return {
        password: 'existing-password-hash',
        updateCalls: [],
        ...values,
        async update(payload) {
            this.updateCalls.push(payload);
            Object.assign(this, payload);
            return this;
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

test.beforeEach(() => {
    notifyCalls.length = 0;
});

test('bulk resend uses the Complete HMO Enrollment template for selected enrollees', async () => {
    const findCalls = {};
    const staffUpdates = [];
    const auditLogs = [];
    const enrollees = [
        createEnrollee({
            id: 'enrollee-1',
            staffId: 'staff-1',
            companyId: 'company-1',
            firstName: 'Ada',
            lastName: 'Okafor',
            email: 'ada@example.com',
            phoneNumber: '08010000001',
            policyNumber: 'ALT-001',
            Company: { id: 'company-1', name: 'Example Limited' }
        }),
        createEnrollee({
            id: 'enrollee-2',
            staffId: 'staff-2',
            companyId: 'company-1',
            firstName: 'Tomi',
            lastName: 'Okafor',
            email: null,
            phoneNumber: '08010000002',
            policyNumber: 'ALT-002',
            Company: { id: 'company-1', name: 'Example Limited' }
        })
    ];
    const models = {
        Enrollee: {
            async findAll(options) {
                findCalls.enrollees = options;
                return enrollees;
            }
        },
        Company: {},
        Staff: {
            async update(payload, options) {
                staffUpdates.push({ payload, options });
            }
        },
        NotificationTemplate: {
            async findOne(options) {
                findCalls.template = options;
                return {
                    id: 'template-1',
                    act: 'STAFF_ENROLLMENT_REQUIRED',
                    subj: 'Complete HMO Enrollment',
                    emailStatus: true
                };
            }
        },
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
            enrolleeIds: ['enrollee-1', 'enrollee-2', 'enrollee-1'],
            companyId: 'company-1'
        },
        user: { id: 'admin-1', type: 'Admin' }
    };
    const res = createResponse();
    let nextError;

    await bulkResendEnrollmentNotifications(req, res, (error) => {
        nextError = error;
    });

    assert.equal(nextError, undefined);
    assert.equal(findCalls.template.where.act, 'STAFF_ENROLLMENT_REQUIRED');
    assert.equal(findCalls.enrollees.where.companyId, 'company-1');
    assert.equal(res.result.payload.requestedCount, 2);
    assert.equal(res.result.payload.sentCount, 1);
    assert.equal(res.result.payload.failedCount, 1);
    assert.match(res.result.payload.failures[0].reason, /email is not available/i);

    assert.equal(notifyCalls.length, 1);
    assert.equal(notifyCalls[0][1], 'enrollee');
    assert.equal(notifyCalls[0][2], 'STAFF_ENROLLMENT_REQUIRED');
    assert.deepEqual(notifyCalls[0][4], ['email']);
    assert.equal(notifyCalls[0][3].companyName, 'Example Limited');
    assert.equal(notifyCalls[0][3].policyNumber, 'ALT-001');
    assert.ok(notifyCalls[0][3].temporaryPassword);
    assert.notEqual(enrollees[0].password, 'existing-password-hash');
    assert.equal(enrollees[1].updateCalls.length, 0);

    assert.equal(staffUpdates.length, 1);
    assert.equal(auditLogs[0].meta.sentCount, 1);
    assert.equal(auditLogs[0].meta.failedCount, 1);
});

test('company-wide resend requires the selected company confirmation', async () => {
    let queried = false;
    const req = {
        body: {
            companyId: 'company-1',
            sendAllForCompany: true,
            confirmation: 'company-2'
        },
        models: {
            Enrollee: {
                async findAll() {
                    queried = true;
                    return [];
                }
            },
            Company: {
                async findByPk() {
                    queried = true;
                    return { id: 'company-1', name: 'Example Limited' };
                }
            },
            Staff: {},
            NotificationTemplate: {},
            AuditLog: {}
        }
    };
    const res = createResponse();

    await bulkResendEnrollmentNotifications(req, res, () => {});

    assert.equal(res.result.status, 400);
    assert.match(res.result.message, /confirmation/i);
    assert.equal(queried, false);
});

test('company-wide resend resolves every enrollee in only the selected company', async () => {
    let enrolleeFindOptions = null;
    const enrollee = createEnrollee({
        id: 'enrollee-3',
        staffId: 'staff-3',
        companyId: 'company-1',
        firstName: 'Ngozi',
        lastName: 'Eze',
        email: 'ngozi@example.com',
        phoneNumber: '08010000003',
        policyNumber: 'ALT-003',
        Company: { id: 'company-1', name: 'Example Limited' }
    });
    const req = {
        body: {
            companyId: 'company-1',
            sendAllForCompany: true,
            confirmation: 'company-1'
        },
        user: { id: 'admin-1', type: 'Admin' },
        models: {
            Enrollee: {
                async findAll(options) {
                    enrolleeFindOptions = options;
                    return [enrollee];
                }
            },
            Company: {
                async findByPk(id) {
                    return { id, name: 'Example Limited' };
                }
            },
            Staff: { update: async () => {} },
            NotificationTemplate: {
                async findOne() {
                    return {
                        act: 'STAFF_ENROLLMENT_REQUIRED',
                        subj: 'Complete HMO Enrollment',
                        emailStatus: true
                    };
                }
            },
            AuditLog: { create: async (payload) => payload }
        }
    };
    const res = createResponse();

    await bulkResendEnrollmentNotifications(req, res, (error) => {
        throw error;
    });

    assert.deepEqual(enrolleeFindOptions.where, { companyId: 'company-1' });
    assert.equal(res.result.payload.scope, 'company');
    assert.equal(res.result.payload.sentCount, 1);
    assert.equal(res.result.payload.template.subject, 'Complete HMO Enrollment');
});
