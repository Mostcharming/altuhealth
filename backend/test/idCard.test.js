'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');

const { resolveMemberIdCardUrl } = require('../src/utils/idCard');

test('uses a generated ID-card asset when one exists', () => {
    const result = resolveMemberIdCardUrl({
        idCardUrl: 'https://cdn.example.com/id-card.png',
        pictureUrl: 'https://cdn.example.com/picture.png'
    });

    assert.equal(result, 'https://cdn.example.com/id-card.png');
});

test('uses the uploaded member picture when no generated ID card exists', () => {
    const result = resolveMemberIdCardUrl({
        idCardUrl: null,
        pictureUrl: 'https://cdn.example.com/picture.png'
    });

    assert.equal(result, 'https://cdn.example.com/picture.png');
});

test('reports no ID-card asset when neither URL exists', () => {
    assert.equal(resolveMemberIdCardUrl({ idCardUrl: null, pictureUrl: null }), null);
    assert.equal(resolveMemberIdCardUrl(null), null);
});
