/**
 * Validation utilities for benefit-related operations
 */

function validateBenefitCategory(data) {
    const errors = [];
    const { name } = data || {};

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
        errors.push('`name` is required and must be a non-empty string');
    }

    if (name && name.length > 255) {
        errors.push('`name` must be 255 characters or less');
    }

    return errors;
}

function validateBenefit(data) {
    const errors = [];
    const { name, description, benefitCategoryId, isCovered, coverageType, coverageValue } = data || {};

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
        errors.push('`name` is required and must be a non-empty string');
    }

    if (name && name.length > 255) {
        errors.push('`name` must be 255 characters or less');
    }

    if (!benefitCategoryId || typeof benefitCategoryId !== 'string' || benefitCategoryId.trim().length === 0) {
        errors.push('`benefitCategoryId` is required and must be a valid UUID');
    }

    if (description && typeof description !== 'string') {
        errors.push('`description` must be a string if provided');
    }

    if (description && description.length > 1000) {
        errors.push('`description` must be 1000 characters or less');
    }

    // Validate coverage type and value when benefit is covered
    if (isCovered) {
        if (!coverageType || !['times_per_year', 'times_per_month', 'quarterly', 'unlimited', 'amount_based', 'limit_based'].includes(coverageType)) {
            errors.push('`coverageType` must be one of: times_per_year, times_per_month, quarterly, unlimited, amount_based, limit_based when isCovered is true');
        }

        if (coverageType && coverageType !== 'unlimited' && (!coverageValue || String(coverageValue).trim().length === 0)) {
            errors.push('`coverageValue` is required when coverageType is not unlimited');
        }
    }

    return errors;
}

function validateBenefitUpdate(data) {
    const errors = [];
    const { name, description, benefitCategoryId, isCovered, coverageType, coverageValue } = data || {};

    if (name !== undefined) {
        if (!name || typeof name !== 'string' || name.trim().length === 0) {
            errors.push('`name` must be a non-empty string if provided');
        }
        if (name && name.length > 255) {
            errors.push('`name` must be 255 characters or less');
        }
    }

    if (benefitCategoryId !== undefined) {
        if (!benefitCategoryId || typeof benefitCategoryId !== 'string' || benefitCategoryId.trim().length === 0) {
            errors.push('`benefitCategoryId` must be a valid UUID if provided');
        }
    }

    if (description !== undefined && description !== null) {
        if (typeof description !== 'string') {
            errors.push('`description` must be a string if provided');
        }
        if (description && description.length > 1000) {
            errors.push('`description` must be 1000 characters or less');
        }
    }

    // Validate coverage type and value when isCovered is being updated
    if (isCovered !== undefined && isCovered === true) {
        if (coverageType !== undefined) {
            if (!['times_per_year', 'times_per_month', 'quarterly', 'unlimited', 'amount_based', 'limit_based'].includes(coverageType)) {
                errors.push('`coverageType` must be one of: times_per_year, times_per_month, quarterly, unlimited, amount_based, limit_based');
            }

            if (coverageType && coverageType !== 'unlimited' && (!coverageValue || String(coverageValue).trim().length === 0)) {
                errors.push('`coverageValue` is required when coverageType is not unlimited');
            }
        }
    }

    return errors;
}

module.exports = {
    validateBenefitCategory,
    validateBenefit,
    validateBenefitUpdate,
};
