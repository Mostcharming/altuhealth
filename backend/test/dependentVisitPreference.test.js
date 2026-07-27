'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');

const migration = require('../src/database/migrations/20260727000000-add-dependent-visit-notification-preference');
const accountController = require('../src/modules/enrollee/account/controller');
const notificationsController = require('../src/modules/enrollee/notifications/controller');
const medicalHistoryController = require('../src/modules/enrollee/enrolleeDependents/medicalHistoryController');

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

test('migration adds the nullable setup preference to both enrollee tables', async () => {
    const calls = [];
    const transaction = {
        async commit() {
            calls.push(['commit']);
        },
        async rollback() {
            calls.push(['rollback']);
        }
    };
    const queryInterface = {
        sequelize: {
            async transaction() {
                return transaction;
            }
        },
        async addColumn(table, column, definition, options) {
            calls.push(['addColumn', table, column, definition, options]);
        }
    };

    await migration.up(queryInterface, { BOOLEAN: 'BOOLEAN' });

    assert.deepEqual(
        calls.filter(([operation]) => operation === 'addColumn').map(([, table, column]) => [table, column]),
        [
            ['enrollees', 'dependent_visit_notifications_enabled'],
            ['retail_enrollees', 'dependent_visit_notifications_enabled']
        ]
    );
    assert.equal(calls.at(-1)[0], 'commit');
    assert.equal(
        calls.find(([operation]) => operation === 'addColumn')[3].allowNull,
        true
    );
});

test('retail enrollees can save the dependent visit preference', async () => {
    const updates = [];
    const req = {
        user: { id: 'retail-1', type: 'RetailEnrollee' },
        body: { enabled: true },
        models: {
            Enrollee: {
                async findByPk() {
                    throw new Error('Wrong account model selected');
                }
            },
            RetailEnrollee: {
                async findByPk(id) {
                    assert.equal(id, 'retail-1');
                    return {
                        async update(payload) {
                            updates.push(payload);
                        }
                    };
                }
            }
        }
    };
    const res = makeResponse();

    await accountController.updateDependentVisitPreference(req, res, (error) => {
        throw error;
    });

    assert.deepEqual(updates, [{ dependentVisitNotificationsEnabled: true }]);
    assert.equal(res.result.ok, true);
    assert.equal(res.result.data.dependentVisitNotificationsEnabled, true);
});

test('notification lists use the authenticated retail enrollee instead of a query-string owner', async () => {
    let receivedWhere = null;
    const req = {
        user: { id: 'retail-2', type: 'RetailEnrollee' },
        query: { enrolleeId: 'someone-else' },
        models: {
            RetailEnrolleeNotification: {
                async findAndCountAll(options) {
                    receivedWhere = options.where;
                    return { count: 0, rows: [] };
                }
            }
        }
    };
    const res = makeResponse();

    await notificationsController.listNotifications(req, res, (error) => {
        throw error;
    });

    assert.deepEqual(receivedWhere, { retailEnrolleeId: 'retail-2' });
    assert.equal(res.result.ok, true);
});

test('dependent medical history stays unavailable when visit notifications are disabled', async () => {
    let historyQueried = false;
    const req = {
        user: { id: 'enrollee-1', type: 'Enrollee' },
        query: {},
        models: {
            Enrollee: {
                async findByPk() {
                    return { id: 'enrollee-1', dependentVisitNotificationsEnabled: false };
                }
            },
            EnrolleeDependent: {
                async findAll() {
                    throw new Error('Dependents should not be queried without consent');
                }
            },
            EnrolleeDependentMedicalHistory: {
                async findAndCountAll() {
                    historyQueried = true;
                    return { count: 0, rows: [] };
                }
            }
        }
    };
    const res = makeResponse();

    await medicalHistoryController.listAllDependentMedicalHistory(req, res, (error) => {
        throw error;
    });

    assert.equal(historyQueried, false);
    assert.equal(res.result.ok, false);
    assert.equal(res.result.status, 403);
});
