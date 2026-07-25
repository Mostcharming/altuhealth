'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');

const migration = require('../src/database/migrations/20260725000000-add-dependent-added-email-notification');

test('creates the dependent enrollment template and updates admin templates', async () => {
    const inserts = [];
    const updates = [];
    const queryInterface = {
        rawSelect: async () => null,
        bulkInsert: async (...args) => inserts.push(args),
        bulkUpdate: async (...args) => updates.push(args)
    };

    await migration.up(queryInterface);

    assert.equal(inserts.length, 1);
    assert.equal(inserts[0][0], 'notification_templates');
    assert.equal(inserts[0][1][0].act, 'DEPENDENT_ENROLLMENT');
    assert.match(inserts[0][1][0].email_body, /has added you as a dependent/);
    assert.match(inserts[0][1][0].email_body, /start enjoying the benefits/);

    const accountUpdate = updates.find(([, , where]) => Array.isArray(where.act));
    assert.ok(accountUpdate);
    assert.deepEqual(accountUpdate[2].act, [
        'ENROLLEE_DEPENDENT_CREATED',
        'RETAIL_ENROLLEE_DEPENDENT_CREATED'
    ]);
    assert.match(accountUpdate[1].email_body, /start enjoying the benefits/);
});

test('updates the dependent enrollment template when it already exists', async () => {
    const inserts = [];
    const updates = [];
    const queryInterface = {
        rawSelect: async () => 'template-1',
        bulkInsert: async (...args) => inserts.push(args),
        bulkUpdate: async (...args) => updates.push(args)
    };

    await migration.up(queryInterface);

    assert.equal(inserts.length, 0);
    assert.equal(updates[0][2].act, 'DEPENDENT_ENROLLMENT');
    assert.match(updates[0][1].email_body, /coverage is now active/);
});
