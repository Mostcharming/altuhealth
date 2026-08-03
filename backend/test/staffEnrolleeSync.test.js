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

const { updateStaff } = require('../src/modules/admin/staffs/controller');

function createRecord(values) {
    return {
        ...values,
        updateCalls: [],
        async update(updates, options) {
            this.updateCalls.push({ updates, options });
            Object.assign(this, updates);
            return this;
        }
    };
}

test('staff updates synchronize shared fields to the linked enrollee in one transaction', async () => {
    const transaction = {
        finished: null,
        async commit() {
            this.finished = 'commit';
        },
        async rollback() {
            this.finished = 'rollback';
        }
    };
    const staff = createRecord({
        id: 'staff-1',
        firstName: 'Old',
        lastName: 'Name',
        companyId: 'company-1'
    });
    const enrollee = createRecord({
        id: 'enrollee-1',
        staffId: 'staff-1',
        email: 'old@example.com',
        phoneNumber: '08000000000',
        dateOfBirth: '1990-01-01'
    });

    const models = {
        Staff: {
            sequelize: { transaction: async () => transaction },
            findByPk: async () => staff,
            findOne: async () => null
        },
        Enrollee: {
            findOne: async ({ where }) => where.staffId ? enrollee : null
        },
        Company: {},
        CompanySubsidiary: {},
        Subscription: {},
        AuditLog: { create: async (payload) => payload }
    };
    const req = {
        models,
        params: { id: 'staff-1' },
        body: {
            firstName: 'Ada',
            middleName: 'Nneka',
            lastName: 'Okafor',
            email: 'ada@example.com',
            phoneNumber: '08012345678',
            dateOfBirth: '1992-05-12',
            maxDependents: 4,
            preexistingMedicalRecords: 'Asthma',
            isActive: false
        },
        user: { id: 'admin-1', type: 'admin' }
    };
    const response = {};
    const res = {
        success(payload, message) {
            response.payload = payload;
            response.message = message;
            return response;
        },
        fail(message, status) {
            throw new Error(`${status}: ${message}`);
        }
    };
    let nextError;

    await updateStaff(req, res, (error) => {
        nextError = error;
    });

    assert.equal(nextError, undefined);
    assert.equal(transaction.finished, 'commit');
    assert.equal(staff.updateCalls.length, 1);
    assert.equal(enrollee.updateCalls.length, 1);
    assert.equal(staff.updateCalls[0].options.transaction, transaction);
    assert.equal(enrollee.updateCalls[0].options.transaction, transaction);
    assert.deepEqual(enrollee.updateCalls[0].updates, {
        firstName: 'Ada',
        middleName: 'Nneka',
        lastName: 'Okafor',
        email: 'ada@example.com',
        phoneNumber: '08012345678',
        dateOfBirth: '1992-05-12',
        maxDependents: 4,
        preexistingMedicalRecords: 'Asthma',
        isActive: false
    });
    assert.equal(response.message, 'Staff and linked enrollee updated');
});

test('required enrollee fields are preserved when optional staff values are cleared', async () => {
    const transaction = {
        finished: null,
        async commit() {
            this.finished = 'commit';
        },
        async rollback() {
            this.finished = 'rollback';
        }
    };
    const staff = createRecord({ id: 'staff-1', companyId: 'company-1' });
    const enrollee = createRecord({
        id: 'enrollee-1',
        staffId: 'staff-1',
        email: 'keep@example.com',
        phoneNumber: '08000000000',
        dateOfBirth: '1990-01-01'
    });
    const models = {
        Staff: {
            sequelize: { transaction: async () => transaction },
            findByPk: async () => staff,
            findOne: async () => null
        },
        Enrollee: {
            findOne: async ({ where }) => where.staffId ? enrollee : null
        },
        Company: {},
        CompanySubsidiary: {},
        Subscription: {},
        AuditLog: { create: async (payload) => payload }
    };
    const req = {
        models,
        params: { id: 'staff-1' },
        body: {
            middleName: '',
            email: '',
            phoneNumber: '',
            dateOfBirth: '',
            maxDependents: '',
            preexistingMedicalRecords: ''
        }
    };
    const res = {
        success: (payload) => payload,
        fail(message, status) {
            throw new Error(`${status}: ${message}`);
        }
    };
    let nextError;

    await updateStaff(req, res, (error) => {
        nextError = error;
    });

    assert.equal(nextError, undefined);
    assert.equal(transaction.finished, 'commit');
    assert.deepEqual(enrollee.updateCalls[0].updates, {
        middleName: '',
        maxDependents: null,
        preexistingMedicalRecords: null
    });
    assert.equal(enrollee.email, 'keep@example.com');
    assert.equal(enrollee.phoneNumber, '08000000000');
    assert.equal(enrollee.dateOfBirth, '1990-01-01');
});
