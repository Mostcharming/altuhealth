'use strict';

async function createMedicalHistoryForAuthorization(models, authorizationCode, options = {}) {
    if (!models) {
        throw new Error('models is required');
    }

    if (!authorizationCode) {
        throw new Error('authorizationCode is required');
    }

    const data = typeof authorizationCode.toJSON === 'function'
        ? authorizationCode.toJSON()
        : authorizationCode;

    const payload = {
        providerId: data.providerId || null,
        diagnosisId: data.diagnosisId || null,
        evsCode: data.authorizationCode || null,
        amount: data.amountAuthorized || null,
        serviceDate: data.validFrom || null,
        notes: data.notes || data.reasonForCode || null,
        status: options.status || 'pending',
        currency: data.currency || 'NGN',
        attachmentUrl: options.attachmentUrl || null
    };

    const createOptions = {};
    if (options.transaction) createOptions.transaction = options.transaction;

    if (data.enrolleeId) {
        return models.EnrolleeMedicalHistory.create(
            { ...payload, enrolleeId: data.enrolleeId },
            createOptions
        );
    }

    if (data.enrolleeDependentId) {
        return models.EnrolleeDependentMedicalHistory.create(
            { ...payload, enrolleeDependentId: data.enrolleeDependentId },
            createOptions
        );
    }

    if (data.retailEnrolleeId) {
        return models.RetailEnrolleeMedicalHistory.create(
            { ...payload, retailEnrolleeId: data.retailEnrolleeId },
            createOptions
        );
    }

    if (data.retailEnrolleeDependentId) {
        if (!models.RetailEnrolleeDependentMedicalHistory) {
            throw new Error('models.RetailEnrolleeDependentMedicalHistory is required');
        }

        return models.RetailEnrolleeDependentMedicalHistory.create(
            {
                ...payload,
                retailEnrolleeDependentId: data.retailEnrolleeDependentId
            },
            createOptions
        );
    }

    throw new Error('Authorization code does not reference a supported member type');
}

module.exports = {
    createMedicalHistoryForAuthorization
};
