'use strict';

/**
 * Service Pricing Validation Utility
 * Provides helper functions for validating and managing service pricing
 */

const PRICE_TYPES = {
    FIXED: 'fixed',
    RATE: 'rate'
};

const RATE_TYPES = {
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
};

/**
 * Get all available price types
 * @returns {Array} Array of price type strings
 */
function getPriceTypes() {
    return Object.values(PRICE_TYPES);
}

/**
 * Get all available rate types
 * @returns {Array} Array of rate type strings
 */
function getRateTypes() {
    return Object.values(RATE_TYPES);
}

/**
 * Get human-readable label for a rate type
 * @param {string} rateType - The rate type
 * @returns {string} Human-readable label
 */
function getRateTypeLabel(rateType) {
    const labels = {
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
    };
    return labels[rateType] || rateType;
}

/**
 * Validate pricing data for a service
 * @param {Object} data - The pricing data to validate
 * @param {string} data.priceType - 'fixed' or 'rate'
 * @param {number} data.fixedPrice - Price for fixed pricing
 * @param {number} data.price - Legacy price field (backward compatibility)
 * @param {string} data.rateType - Type of rate
 * @param {number} data.rateAmount - Amount for rate pricing
 * @returns {Object} { isValid: boolean, error: string|null, warnings: Array }
 */
function validatePricing(data) {
    const result = {
        isValid: true,
        error: null,
        warnings: []
    };

    const priceType = (data.priceType || PRICE_TYPES.FIXED).toLowerCase();

    // Validate price type
    if (!getPriceTypes().includes(priceType)) {
        result.isValid = false;
        result.error = `Invalid priceType: ${priceType}. Must be one of: ${getPriceTypes().join(', ')}`;
        return result;
    }

    if (priceType === PRICE_TYPES.FIXED) {
        const fixedPrice = data.fixedPrice || data.price;

        if (!fixedPrice) {
            result.isValid = false;
            result.error = 'fixedPrice is required for fixed pricing type';
            return result;
        }

        const parsedPrice = parseFloat(fixedPrice);
        if (isNaN(parsedPrice) || parsedPrice <= 0) {
            result.isValid = false;
            result.error = 'fixedPrice must be a valid positive number';
            return result;
        }

        // Check for orphaned rate fields
        if (data.rateType || data.rateAmount) {
            result.warnings.push('rateType and rateAmount will be ignored for fixed pricing');
        }
    } else if (priceType === PRICE_TYPES.RATE) {
        if (!data.rateType) {
            result.isValid = false;
            result.error = 'rateType is required for rate pricing type';
            return result;
        }

        const rateType = data.rateType.toLowerCase();
        if (!getRateTypes().includes(rateType)) {
            result.isValid = false;
            result.error = `Invalid rateType: ${rateType}. Must be one of: ${getRateTypes().join(', ')}`;
            return result;
        }

        if (!data.rateAmount) {
            result.isValid = false;
            result.error = 'rateAmount is required for rate pricing type';
            return result;
        }

        const parsedAmount = parseFloat(data.rateAmount);
        if (isNaN(parsedAmount) || parsedAmount <= 0) {
            result.isValid = false;
            result.error = 'rateAmount must be a valid positive number';
            return result;
        }

        // Check for orphaned fixed price
        if (data.fixedPrice || data.price) {
            result.warnings.push('fixedPrice and price will be ignored for rate-based pricing');
        }
    }

    return result;
}

/**
 * Normalize pricing data based on pricing type
 * @param {Object} data - The pricing data
 * @returns {Object} Normalized pricing data
 */
function normalizePricing(data) {
    const normalized = {
        priceType: (data.priceType || PRICE_TYPES.FIXED).toLowerCase(),
        fixedPrice: null,
        rateType: null,
        rateAmount: null,
        price: null // For backward compatibility
    };

    if (normalized.priceType === PRICE_TYPES.FIXED) {
        const fixedPrice = parseFloat(data.fixedPrice || data.price);
        normalized.fixedPrice = fixedPrice;
        normalized.price = fixedPrice; // Keep for backward compatibility
    } else if (normalized.priceType === PRICE_TYPES.RATE) {
        normalized.rateType = data.rateType.toLowerCase();
        normalized.rateAmount = parseFloat(data.rateAmount);
    }

    return normalized;
}

/**
 * Get pricing summary for display
 * @param {Object} service - The service object
 * @returns {string} Human-readable pricing summary
 */
function getPricingSummary(service) {
    if (service.priceType === PRICE_TYPES.FIXED) {
        return `Fixed: ${service.fixedPrice || service.price}`;
    } else if (service.priceType === PRICE_TYPES.RATE) {
        return `Rate: ${service.rateAmount} ${getRateTypeLabel(service.rateType)}`;
    }
    return 'No pricing set';
}

/**
 * Compare pricing between two services
 * @param {Object} oldService - Original service
 * @param {Object} newService - Updated service
 * @returns {Object} Pricing changes
 */
function comparePricing(oldService, newService) {
    const changes = {
        priceTypeChanged: oldService.priceType !== newService.priceType,
        amountChanged: false,
        details: {}
    };

    if (oldService.priceType === PRICE_TYPES.FIXED && newService.priceType === PRICE_TYPES.FIXED) {
        changes.amountChanged = (oldService.fixedPrice || oldService.price) !== newService.fixedPrice;
        changes.details = {
            from: oldService.fixedPrice || oldService.price,
            to: newService.fixedPrice
        };
    } else if (oldService.priceType === PRICE_TYPES.RATE && newService.priceType === PRICE_TYPES.RATE) {
        changes.amountChanged = oldService.rateAmount !== newService.rateAmount;
        changes.rateTypeChanged = oldService.rateType !== newService.rateType;
        changes.details = {
            fromRate: oldService.rateType,
            fromAmount: oldService.rateAmount,
            toRate: newService.rateType,
            toAmount: newService.rateAmount
        };
    } else {
        changes.details = {
            from: {
                type: oldService.priceType,
                amount: oldService.priceType === PRICE_TYPES.FIXED
                    ? oldService.fixedPrice || oldService.price
                    : oldService.rateAmount,
                rateType: oldService.rateType
            },
            to: {
                type: newService.priceType,
                amount: newService.priceType === PRICE_TYPES.FIXED
                    ? newService.fixedPrice
                    : newService.rateAmount,
                rateType: newService.rateType
            }
        };
    }

    return changes;
}

/**
 * Format pricing for API response
 * @param {Object} service - Service object
 * @returns {Object} Formatted pricing info
 */
function formatPricingForResponse(service) {
    const pricing = {
        priceType: service.priceType,
        displaySummary: getPricingSummary(service)
    };

    if (service.priceType === PRICE_TYPES.FIXED) {
        pricing.fixedPrice = service.fixedPrice || service.price;
    } else if (service.priceType === PRICE_TYPES.RATE) {
        pricing.rateType = service.rateType;
        pricing.rateTypeLabel = getRateTypeLabel(service.rateType);
        pricing.rateAmount = service.rateAmount;
    }

    return pricing;
}

module.exports = {
    PRICE_TYPES,
    RATE_TYPES,
    getPriceTypes,
    getRateTypes,
    getRateTypeLabel,
    validatePricing,
    normalizePricing,
    getPricingSummary,
    comparePricing,
    formatPricingForResponse
};
