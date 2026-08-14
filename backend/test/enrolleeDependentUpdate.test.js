'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');

const { updateDependent } = require('../src/modules/enrollee/enrolleeDependents/controller');

function makeResponse() {
    return {
        result: null,
        success(data, message, status = 200) {
            this.result = { ok: true, data, message, status };
            return this.result;
        },
        fail(message, status = 400) {
            this.result = { ok: false, message, status };
            return this.result;
        }
    };
}

for (const account of [
    { type: 'Enrollee', model: 'EnrolleeDependent', ownerKey: 'enrolleeId' },
    { type: 'RetailEnrollee', model: 'RetailEnrolleeDependent', ownerKey: 'retailEnrolleeId' }
]) {
    test(`${account.type} can update an owned dependent picture`, async () => {
        let saved = false;
        const dependent = {
            id: 'dependent-1',
            [account.ownerKey]: 'owner-1',
            async save() {
                saved = true;
            },
            toJSON() {
                return { ...this };
            }
        };
        const req = {
            user: { id: 'owner-1', type: account.type },
            params: { id: dependent.id },
            body: {},
            profileImage: { url: '/upload/dependent-photo.webp' },
            models: {
                [account.model]: {
                    async findByPk(id) {
                        assert.equal(id, dependent.id);
                        return dependent;
                    }
                }
            }
        };
        const res = makeResponse();

        await updateDependent(req, res, (error) => {
            throw error;
        });

        assert.equal(saved, true);
        assert.equal(dependent.pictureUrl, '/upload/dependent-photo.webp');
        assert.equal(res.result.ok, true);
        assert.equal(res.result.data.dependent.pictureUrl, '/upload/dependent-photo.webp');
    });
}
