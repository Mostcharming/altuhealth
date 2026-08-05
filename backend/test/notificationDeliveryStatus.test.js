'use strict';

const assert = require('node:assert/strict');
const test = require('node:test');

const notifyProcessModulePath = require.resolve(
    '../src/utils/components/notify/subComponents/NotifyProcess'
);

class FakeNotifyProcess {
    constructor() {
        this.messageResult = '<p>Your code is 123456</p>';
        this.createLog = true;
        this.logEntries = [];
        this.errorLogs = [];
    }

    async getMessage() {
        return this.messageResult;
    }

    async createLogEntry(type) {
        this.logEntries.push(type);
    }

    async createErrorLog(message) {
        this.errorLogs.push(message);
    }
}

require.cache[notifyProcessModulePath] = {
    id: notifyProcessModulePath,
    filename: notifyProcessModulePath,
    loaded: true,
    exports: FakeNotifyProcess
};

delete require.cache[require.resolve('../src/utils/components/notify/subComponents/Email')];
const Email = require('../src/utils/components/notify/subComponents/Email');

test('email sender reports whether SMTP delivery succeeded', async (t) => {
    await t.test('successful delivery', async () => {
        const email = new Email({
            emailNotification: true,
            mailConfig: { name: 'smtp' }
        });
        email.sendSmtpMail = async () => {};

        assert.equal(await email.send(), true);
        assert.deepEqual(email.logEntries, ['email']);
        assert.deepEqual(email.errorLogs, []);
    });

    await t.test('disabled or unavailable message', async () => {
        const email = new Email({
            emailNotification: false,
            mailConfig: { name: 'smtp' }
        });

        assert.equal(await email.send(), false);
    });

    await t.test('SMTP failure', async () => {
        const email = new Email({
            emailNotification: true,
            mailConfig: { name: 'smtp' }
        });
        email.sendSmtpMail = async () => {
            throw new Error('SMTP unavailable');
        };

        assert.equal(await email.send(), false);
        assert.deepEqual(email.errorLogs, ['SMTP unavailable']);
    });

    await t.test('logging failure after delivery', async () => {
        const email = new Email({
            emailNotification: true,
            mailConfig: { name: 'smtp' }
        });
        email.sendSmtpMail = async () => {};
        email.createLogEntry = async () => {
            throw new Error('log unavailable');
        };

        assert.equal(await email.send(), true);
        assert.deepEqual(email.errorLogs, [
            'Email sent but notification logging failed: log unavailable'
        ]);
    });
});

test('notify returns per-channel delivery results to callers', async () => {
    const emailModulePath = require.resolve('../src/utils/components/notify/subComponents/Email');
    const smsModulePath = require.resolve('../src/utils/components/notify/subComponents/sms/Sms');
    const settingsModulePath = require.resolve('../src/utils/generalSettings');
    const notifyClassModulePath = require.resolve('../src/utils/components/notify/Notify');
    const notifyFunctionModulePath = require.resolve('../src/utils/notify');

    class SuccessfulEmail {
        async send() {
            return true;
        }
    }

    class UnusedSms {
        async send() {
            return false;
        }
    }

    require.cache[emailModulePath] = {
        id: emailModulePath,
        filename: emailModulePath,
        loaded: true,
        exports: SuccessfulEmail
    };
    require.cache[smsModulePath] = {
        id: smsModulePath,
        filename: smsModulePath,
        loaded: true,
        exports: UnusedSms
    };
    require.cache[settingsModulePath] = {
        id: settingsModulePath,
        filename: settingsModulePath,
        loaded: true,
        exports: { getGeneralSettings: async () => ({ emailNotification: true }) }
    };

    delete require.cache[notifyClassModulePath];
    delete require.cache[notifyFunctionModulePath];
    const notify = require('../src/utils/notify');

    const result = await notify(
        { id: 'enrollee-1', email: 'member@example.com' },
        'Enrollee',
        'OTP',
        { code: '123456' },
        ['email'],
        true
    );

    assert.deepEqual(result, { email: true });
});
