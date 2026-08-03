'use strict';

function removeIdentifierWhitespace(value) {
    if (typeof value !== 'string') return null;
    return value.replace(/\s+/g, '');
}

function normalizeEmailIdentifier(value) {
    const normalized = removeIdentifierWhitespace(value);
    return normalized ? normalized.toLowerCase() : normalized;
}

function normalizePolicyIdentifier(value) {
    const normalized = removeIdentifierWhitespace(value);
    return normalized ? normalized.toUpperCase() : normalized;
}

module.exports = {
    removeIdentifierWhitespace,
    normalizeEmailIdentifier,
    normalizePolicyIdentifier
};
