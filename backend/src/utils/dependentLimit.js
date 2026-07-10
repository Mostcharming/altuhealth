'use strict';

class DependentLimitError extends Error {
    constructor(message, code, statusCode = 400) {
        super(message);
        this.name = 'DependentLimitError';
        this.code = code;
        this.statusCode = statusCode;
    }
}

const normalizeMaxDependents = (value, subjectLabel) => {
    if (value === null || value === undefined || value === '') {
        throw new DependentLimitError(
            `Maximum number of dependents has not been specified for this ${subjectLabel}`,
            'DEPENDENT_LIMIT_NOT_CONFIGURED'
        );
    }

    const maxDependents = Number(value);
    if (!Number.isInteger(maxDependents) || maxDependents < 0) {
        throw new DependentLimitError(
            `Maximum number of dependents is invalid for this ${subjectLabel}`,
            'DEPENDENT_LIMIT_INVALID'
        );
    }

    return maxDependents;
};

/**
 * Serializes dependent creation for one enrollee, verifies the configured
 * limit, and runs the supplied operation in the same transaction.
 */
async function withDependentCapacity({
    ParentModel,
    DependentModel,
    parentId,
    foreignKey,
    subjectLabel = 'enrollee',
    notFoundMessage = 'Enrollee not found'
}, operation) {
    if (!ParentModel || !DependentModel) {
        throw new Error('Parent and dependent models are required');
    }
    if (typeof operation !== 'function') {
        throw new Error('Dependent creation operation is required');
    }

    const sequelize = ParentModel.sequelize || DependentModel.sequelize;
    if (!sequelize || typeof sequelize.transaction !== 'function') {
        throw new Error('A Sequelize transaction is required to enforce the dependent limit');
    }

    return sequelize.transaction(async (transaction) => {
        const findOptions = { transaction };
        if (transaction.LOCK && transaction.LOCK.UPDATE) {
            findOptions.lock = transaction.LOCK.UPDATE;
        }

        const parent = await ParentModel.findByPk(parentId, findOptions);
        if (!parent) {
            throw new DependentLimitError(notFoundMessage, 'DEPENDENT_PARENT_NOT_FOUND', 404);
        }

        const maxDependents = normalizeMaxDependents(parent.maxDependents, subjectLabel);
        const dependentCount = await DependentModel.count({
            where: { [foreignKey]: parentId },
            transaction
        });

        if (dependentCount >= maxDependents) {
            throw new DependentLimitError(
                `Maximum number of dependents (${maxDependents}) has been reached for this ${subjectLabel}`,
                'DEPENDENT_LIMIT_REACHED'
            );
        }

        return operation({
            parent,
            dependentCount,
            maxDependents,
            remainingSlots: maxDependents - dependentCount,
            transaction
        });
    });
}

const isDependentLimitError = (error) => error instanceof DependentLimitError;

module.exports = {
    DependentLimitError,
    isDependentLimitError,
    normalizeMaxDependents,
    withDependentCapacity
};
