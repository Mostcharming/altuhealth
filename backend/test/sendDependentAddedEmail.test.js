'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');

const {
    appendLoginPath,
    buildDependentAddedNotification,
    sendDependentAddedEmail
} = require('../src/utils/sendDependentAddedEmail');

const dependent = {
    id: 'dependent-1',
    email: 'ada@example.com',
    firstName: 'Ada',
    lastName: 'Lovelace',
    policyNumber: 'ALT-001-01'
};

const enrollee = {
    firstName: 'Grace',
    lastName: 'Hopper'
};

test('builds the enrollment email for a dependent added by an enrollee', () => {
    const notification = buildDependentAddedNotification({ dependent, enrollee });

    assert.equal(notification.templateName, 'DEPENDENT_ENROLLMENT');
    assert.equal(notification.userType, 'enrollee_dependent');
    assert.deepEqual(notification.sendVia, ['email']);
    assert.equal(notification.shortCodes.dependentName, 'Ada Lovelace');
    assert.equal(notification.shortCodes.enrolleeName, 'Grace Hopper');
    assert.equal(notification.shortCodes.policyNumber, 'ALT-001-01');
});

test('builds the retail enrollment email for a dependent added by a retail enrollee', () => {
    const notification = buildDependentAddedNotification({
        dependent,
        enrollee,
        isRetailEnrollee: true
    });

    assert.equal(notification.templateName, 'DEPENDENT_ENROLLMENT');
    assert.equal(notification.userType, 'retail_enrollee_dependent');
    assert.deepEqual(notification.sendVia, ['email']);
});

test('uses the account-creation email when an admin creates login credentials', () => {
    const notification = buildDependentAddedNotification({
        dependent,
        enrollee,
        temporaryPassword: 'Temporary1!'
    });

    assert.equal(notification.templateName, 'ENROLLEE_DEPENDENT_CREATED');
    assert.equal(notification.shortCodes.temporaryPassword, 'Temporary1!');
    assert.match(notification.shortCodes.loginLink, /\/login$/);
    assert.doesNotMatch(notification.shortCodes.loginLink, /\/login\/login$/);
});

test('uses the retail account-creation email for a retail dependent created by an admin', () => {
    const notification = buildDependentAddedNotification({
        dependent,
        enrollee,
        isRetailEnrollee: true,
        temporaryPassword: 'Temporary1!'
    });

    assert.equal(notification.templateName, 'RETAIL_ENROLLEE_DEPENDENT_CREATED');
    assert.equal(notification.userType, 'retail_enrollee_dependent');
});

test('sends exactly one email and skips dependents without an email address', async () => {
    const calls = [];
    const notifyFn = async (...args) => calls.push(args);

    const sent = await sendDependentAddedEmail({ dependent, enrollee }, notifyFn);
    const skipped = await sendDependentAddedEmail({
        dependent: { ...dependent, email: null },
        enrollee
    }, notifyFn);

    assert.equal(sent, true);
    assert.equal(skipped, false);
    assert.equal(calls.length, 1);
    assert.equal(calls[0][2], 'DEPENDENT_ENROLLMENT');
    assert.deepEqual(calls[0][4], ['email']);
});

test('appends the login path only when needed', () => {
    assert.equal(appendLoginPath('https://example.com/dependent'), 'https://example.com/dependent/login');
    assert.equal(appendLoginPath('https://example.com/login/'), 'https://example.com/login');
});
