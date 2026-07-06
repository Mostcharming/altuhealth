'use strict';

/**
 * Pricing System Constants
 * Centralized constants for service pricing system
 */

const PRICING_CONSTANTS = {
    // Price Types
    PRICE_TYPES: {
        FIXED: 'fixed',
        RATE: 'rate'
    },

    // Rate Types
    RATE_TYPES: {
        PER_SESSION: 'per_session',
        PER_VISIT: 'per_visit',
        PER_HOUR: 'per_hour',
        PER_DAY: 'per_day',
        PER_WEEK: 'per_week',
        PER_MONTH: 'per_month',
        PER_CONSULTATION: 'per_consultation',
        PER_PROCEDURE: 'per_procedure',
        PER_UNIT: 'per_unit',
        PER_MILE: 'per_mile'
    },

    // Rate Type Labels
    RATE_TYPE_LABELS: {
        per_session: 'Per Session',
        per_visit: 'Per Visit',
        per_hour: 'Per Hour',
        per_day: 'Per Day',
        per_week: 'Per Week',
        per_month: 'Per Month',
        per_consultation: 'Per Consultation',
        per_procedure: 'Per Procedure',
        per_unit: 'Per Unit',
        per_mile: 'Per Mile'
    },

    // Rate Type Categories for grouping
    RATE_TYPE_CATEGORIES: {
        TIME_BASED: ['per_hour', 'per_day', 'per_week', 'per_month'],
        VISIT_BASED: ['per_visit', 'per_session', 'per_consultation'],
        PROCEDURE_BASED: ['per_procedure', 'per_unit'],
        DISTANCE_BASED: ['per_mile']
    },

    // Validation constraints
    CONSTRAINTS: {
        MIN_PRICE: 0.01,
        MAX_PRICE: 999999999.99,
        PRICE_DECIMAL_PLACES: 2,
        CODE_MAX_LENGTH: 255,
        NAME_MAX_LENGTH: 255,
        DESCRIPTION_MAX_LENGTH: 2000
    },

    // Messages
    MESSAGES: {
        PRICE_TYPE_INVALID: 'Invalid priceType. Must be one of: fixed, rate',
        RATE_TYPE_INVALID: 'Invalid rateType. Check available rate types',
        FIXED_PRICE_REQUIRED: 'fixedPrice is required when priceType is "fixed"',
        RATE_TYPE_REQUIRED: 'rateType is required when priceType is "rate"',
        RATE_AMOUNT_REQUIRED: 'rateAmount is required when priceType is "rate"',
        INVALID_PRICE_FORMAT: 'Price must be a valid positive number',
        DUPLICATE_CODE: 'Service code already exists',
        NAME_REQUIRED: 'Service name is required',
        PROVIDER_REQUIRED: 'Provider is required',
        PROVIDER_NOT_FOUND: 'Provider not found'
    }
};

/**
 * Get all price type values
 */
function getPriceTypeValues() {
    return Object.values(PRICING_CONSTANTS.PRICE_TYPES);
}

/**
 * Get all rate type values
 */
function getRateTypeValues() {
    return Object.values(PRICING_CONSTANTS.RATE_TYPES);
}

/**
 * Check if a rate type is time-based
 */
function isTimeBasedRate(rateType) {
    return PRICING_CONSTANTS.RATE_TYPE_CATEGORIES.TIME_BASED.includes(rateType);
}

/**
 * Check if a rate type is visit-based
 */
function isVisitBasedRate(rateType) {
    return PRICING_CONSTANTS.RATE_TYPE_CATEGORIES.VISIT_BASED.includes(rateType);
}

/**
 * Check if a rate type is procedure-based
 */
function isProcedureBasedRate(rateType) {
    return PRICING_CONSTANTS.RATE_TYPE_CATEGORIES.PROCEDURE_BASED.includes(rateType);
}

/**
 * Check if a rate type is distance-based
 */
function isDistanceBasedRate(rateType) {
    return PRICING_CONSTANTS.RATE_TYPE_CATEGORIES.DISTANCE_BASED.includes(rateType);
}

/**
 * Get category for a rate type
 */
function getRateTypeCategory(rateType) {
    if (isTimeBasedRate(rateType)) return 'TIME_BASED';
    if (isVisitBasedRate(rateType)) return 'VISIT_BASED';
    if (isProcedureBasedRate(rateType)) return 'PROCEDURE_BASED';
    if (isDistanceBasedRate(rateType)) return 'DISTANCE_BASED';
    return null;
}

module.exports = {
    PRICING_CONSTANTS,
    getPriceTypeValues,
    getRateTypeValues,
    isTimeBasedRate,
    isVisitBasedRate,
    isProcedureBasedRate,
    isDistanceBasedRate,
    getRateTypeCategory
};
