'use strict';

const DEPENDENT_RELATIONSHIPS = Object.freeze([
    'spouse',
    'child',
    'parent',
    'sibling',
    'other'
]);

const MIN_DEPENDENT_AGE_LIMIT = 0;
const MAX_DEPENDENT_AGE_LIMIT = 150;

class DependentAgeLimitValidationError extends Error {
    constructor(message) {
        super(message);
        this.name = 'DependentAgeLimitValidationError';
        this.statusCode = 400;
    }
}

const hasOwn = (value, key) => Object.prototype.hasOwnProperty.call(value, key);

const isPlainObject = (value) => {
    if (value === null || typeof value !== 'object' || Array.isArray(value)) return false;
    const prototype = Object.getPrototypeOf(value);
    return prototype === Object.prototype || prototype === null;
};

const normalizeLimitValue = (value, fieldName) => {
    if (value === null) return null;
    if (typeof value !== 'number' || !Number.isInteger(value)) {
        throw new DependentAgeLimitValidationError(`\`${fieldName}\` must be an integer or null`);
    }
    if (value < MIN_DEPENDENT_AGE_LIMIT || value > MAX_DEPENDENT_AGE_LIMIT) {
        throw new DependentAgeLimitValidationError(
            `\`${fieldName}\` must be between ${MIN_DEPENDENT_AGE_LIMIT} and ${MAX_DEPENDENT_AGE_LIMIT}`
        );
    }
    return value;
};

const normalizeRelationshipLimits = (value) => {
    if (!isPlainObject(value)) {
        throw new DependentAgeLimitValidationError('`dependentAgeLimits` must be an object');
    }

    const unknownKeys = Object.keys(value).filter((key) => !DEPENDENT_RELATIONSHIPS.includes(key));
    if (unknownKeys.length > 0) {
        throw new DependentAgeLimitValidationError(
            `Unknown dependent age limit relationship${unknownKeys.length > 1 ? 's' : ''}: ${unknownKeys.join(', ')}`
        );
    }

    return Object.entries(value).reduce((normalized, [relationship, limit]) => {
        normalized[relationship] = normalizeLimitValue(limit, `dependentAgeLimits.${relationship}`);
        return normalized;
    }, {});
};

const fanOutLimit = (limit) => DEPENDENT_RELATIONSHIPS.reduce((limits, relationship) => {
    limits[relationship] = limit;
    return limits;
}, {});

const getRawDependentAgeLimits = (record) => {
    if (!record) return {};

    const raw = typeof record.getDataValue === 'function'
        ? record.getDataValue('dependentAgeLimits')
        : record.dependentAgeLimits;

    return isPlainObject(raw) ? { ...raw } : {};
};

const getEffectiveDependentAgeLimits = (storedLimits, legacyLimit) => {
    const raw = isPlainObject(storedLimits) ? storedLimits : {};
    const fallback = legacyLimit === null
        || (typeof legacyLimit === 'number'
            && Number.isInteger(legacyLimit)
            && legacyLimit >= MIN_DEPENDENT_AGE_LIMIT
            && legacyLimit <= MAX_DEPENDENT_AGE_LIMIT)
        ? legacyLimit
        : null;

    return DEPENDENT_RELATIONSHIPS.reduce((limits, relationship) => {
        const storedValue = raw[relationship];
        const hasValidStoredValue = storedValue === null
            || (typeof storedValue === 'number'
                && Number.isInteger(storedValue)
                && storedValue >= MIN_DEPENDENT_AGE_LIMIT
                && storedValue <= MAX_DEPENDENT_AGE_LIMIT);

        limits[relationship] = hasOwn(raw, relationship) && hasValidStoredValue
            ? storedValue
            : fallback;
        return limits;
    }, {});
};

const getEffectiveDependentAgeLimitsFromRecord = (record) => getEffectiveDependentAgeLimits(
    getRawDependentAgeLimits(record),
    record && record.dependentAgeLimit !== undefined ? record.dependentAgeLimit : null
);

/**
 * Normalizes the legacy scalar and relationship map as one dual-write unit.
 *
 * - A scalar-only write fans the value out to every relationship.
 * - A map-only update merges into the stored raw map.
 * - When both are supplied, the scalar is fanned out first and map values win.
 */
const normalizeDependentAgeLimitPayload = (payload = {}, options = {}) => {
    const source = isPlainObject(payload) ? payload : {};
    const hasLegacyLimit = hasOwn(source, 'dependentAgeLimit');
    const hasRelationshipLimits = hasOwn(source, 'dependentAgeLimits');

    if (!hasLegacyLimit && !hasRelationshipLimits) return {};

    const result = {};
    let normalizedLegacyLimit;

    if (hasLegacyLimit) {
        normalizedLegacyLimit = normalizeLimitValue(source.dependentAgeLimit, 'dependentAgeLimit');
        result.dependentAgeLimit = normalizedLegacyLimit;
    }

    const existingLimits = isPlainObject(options.existingDependentAgeLimits)
        ? { ...options.existingDependentAgeLimits }
        : {};
    let normalizedLimits = hasLegacyLimit
        ? fanOutLimit(normalizedLegacyLimit)
        : (options.partial ? existingLimits : {});

    if (hasRelationshipLimits) {
        normalizedLimits = {
            ...normalizedLimits,
            ...normalizeRelationshipLimits(source.dependentAgeLimits)
        };
    }

    result.dependentAgeLimits = normalizedLimits;
    return result;
};

const validateStoredDependentAgeLimits = (value) => {
    normalizeRelationshipLimits(value);
    return true;
};

const isDependentAgeLimitValidationError = (error) => (
    error instanceof DependentAgeLimitValidationError
    || error?.name === 'DependentAgeLimitValidationError'
);

module.exports = {
    DEPENDENT_RELATIONSHIPS,
    MIN_DEPENDENT_AGE_LIMIT,
    MAX_DEPENDENT_AGE_LIMIT,
    DependentAgeLimitValidationError,
    getRawDependentAgeLimits,
    getEffectiveDependentAgeLimits,
    getEffectiveDependentAgeLimitsFromRecord,
    normalizeDependentAgeLimitPayload,
    validateStoredDependentAgeLimits,
    isDependentAgeLimitValidationError
};
