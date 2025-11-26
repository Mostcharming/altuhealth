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
    const { name, description, limit, amount, benefitCategoryId } = data || {};

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
        errors.push('`name` is required and must be a non-empty string');
    }

    if (name && name.length > 255) {
        errors.push('`name` must be 255 characters or less');
    }

    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
        errors.push('`amount` is required and must be a positive number');
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

    // if (limit && typeof limit !== 'string') {
    //     errors.push('`limit` must be a string if provided');
    // }

    if (limit && limit.length > 255) {
        errors.push('`limit` must be 255 characters or less');
    }

    return errors;
}

function validateBenefitUpdate(data) {
    const errors = [];
    const { name, description, limit, amount, benefitCategoryId } = data || {};

    if (name !== undefined) {
        if (!name || typeof name !== 'string' || name.trim().length === 0) {
            errors.push('`name` must be a non-empty string if provided');
        }
        if (name && name.length > 255) {
            errors.push('`name` must be 255 characters or less');
        }
    }

    if (amount !== undefined) {
        if (isNaN(Number(amount)) || Number(amount) <= 0) {
            errors.push('`amount` must be a positive number if provided');
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

    if (limit !== undefined && limit !== null) {
        if (typeof limit !== 'string') {
            errors.push('`limit` must be a string if provided');
        }
        if (limit && limit.length > 255) {
            errors.push('`limit` must be 255 characters or less');
        }
    }

    return errors;
}

module.exports = {
    validateBenefitCategory,
    validateBenefit,
    validateBenefitUpdate,
};
