/**
 * Utility functions for subscription calculations
 */

const crypto = require('crypto');

/**
 * Calculate plan cycle from start and end dates
 * @param {Date} startDate - Subscription start date
 * @param {Date} endDate - Subscription end date
 * @returns {string} Plan cycle (monthly, quarterly, semi_annual, annual)
 */
function calculatePlanCycleFromDates(startDate, endDate) {
    if (!startDate || !endDate) {
        return 'monthly'; // default
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    // Calculate the difference in days
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    // Determine cycle based on days
    if (diffDays >= 355 && diffDays <= 370) {
        return 'annual';
    } else if (diffDays >= 175 && diffDays <= 185) {
        return 'semi_annual';
    } else if (diffDays >= 85 && diffDays <= 95) {
        return 'quarterly';
    } else {
        return 'monthly';
    }
}

/**
 * Calculate amount paid based on plan's annual premium and cycle
 * @param {number} annualPremium - Annual premium price from plan
 * @param {string} planCycle - Plan cycle (monthly, quarterly, semi_annual, annual)
 * @returns {number} Amount to be paid for the cycle
 */
function calculateAmountPaidFromPlan(annualPremium, planCycle) {
    if (!annualPremium) {
        return 0;
    }

    const premium = parseFloat(annualPremium);

    switch (planCycle) {
        case 'annual':
            return premium;
        case 'semi_annual':
            return premium / 2;
        case 'quarterly':
            return premium / 4;
        case 'monthly':
            return premium / 12;
        default:
            return premium / 12;
    }
}

/**
 * Generate a payment reference number
 * Format: PAY-{timestamp}-{random}
 * @returns {string} Payment reference number
 */
function generatePaymentReference() {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = crypto.randomBytes(4).toString('hex').toUpperCase();
    return `PAY-${timestamp}-${random}`;
}

/**
 * Calculate subscription end date from start date and plan cycle
 * @param {Date} startDate - Subscription start date
 * @param {string} planCycle - Plan cycle (monthly, quarterly, semi_annual, annual)
 * @returns {Date} Calculated end date
 */
function calculateEndDateFromCycle(startDate, planCycle) {
    const start = new Date(startDate);
    const end = new Date(startDate);

    switch (planCycle) {
        case 'annual':
            end.setFullYear(end.getFullYear() + 1);
            break;
        case 'semi_annual':
            end.setMonth(end.getMonth() + 6);
            break;
        case 'quarterly':
            end.setMonth(end.getMonth() + 3);
            break;
        case 'monthly':
        default:
            end.setMonth(end.getMonth() + 1);
            break;
    }

    // Subtract 1 day to get the last day of the cycle
    end.setDate(end.getDate() - 1);
    return end;
}

module.exports = {
    calculatePlanCycleFromDates,
    calculateAmountPaidFromPlan,
    generatePaymentReference,
    calculateEndDateFromCycle
};
