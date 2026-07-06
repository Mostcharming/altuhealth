const { Op } = require('sequelize');
const { addAuditLog } = require('../../../utils/addAdminNotification');
const { getUniqueAuthorizationCode } = require('../../../utils/authorizationCodeGenerator');

async function createAuthorizationCode(req, res, next) {
    try {
        const { AuthorizationCode, EnrolleeDependent, Provider, Diagnosis } = req.models;
        const { dependentId } = req.params;
        const {
            providerId,
            diagnosisId,
            reason,
            authorizationType,
            validFrom,
            validTo,
            amountAuthorized,
            notes
        } = req.body || {};

        if (!dependentId) return res.fail('`dependentId` is required', 400);
        if (!authorizationType) return res.fail('`authorizationType` is required', 400);
        if (!validFrom) return res.fail('`validFrom` is required', 400);
        if (!validTo) return res.fail('`validTo` is required', 400);

        // Verify dependent exists
        const dependent = await EnrolleeDependent.findByPk(dependentId);
        if (!dependent) return res.fail('Dependent not found', 404);

        // Verify provider exists if provided
        if (providerId) {
            const provider = await Provider.findByPk(providerId);
            if (!provider) return res.fail('Provider not found', 404);
        }

        // Verify diagnosis exists if provided
        if (diagnosisId) {
            const diagnosis = await Diagnosis.findByPk(diagnosisId);
            if (!diagnosis) return res.fail('Diagnosis not found', 404);
        }

        // Generate unique authorization code
        const authCode = await getUniqueAuthorizationCode(AuthorizationCode);

        // Create authorization code record
        const authorizationCode = await AuthorizationCode.create({
            authorizationCode: authCode,
            enrolleeDependentId: dependentId,
            providerId: providerId || null,
            diagnosisId: diagnosisId || null,
            reasonForCode: reason || null,
            authorizationType,
            validFrom: new Date(validFrom),
            validTo: new Date(validTo),
            amountAuthorized: amountAuthorized || null,
            status: 'active',
            notes: notes || null
        });

        // Add audit log
        await addAuditLog(req.models, {
            action: 'dependentAuthorizationCode.created',
            message: `Created authorization code ${authCode} for dependent ${dependentId}`,
            userId: req.user?.id,
            userType: 'admin'
        });

        return res.success(
            { authorizationCode },
            'Authorization code created successfully',
            201
        );
    } catch (error) {
        console.error('Error creating authorization code:', error);
        next(error);
    }
}

async function getAuthorizationCodes(req, res, next) {
    try {
        const { AuthorizationCode, Provider, Diagnosis } = req.models;
        const { dependentId } = req.params;
        const { page = 1, limit = 10, status = null, isUsed = null } = req.query;

        if (!dependentId) return res.fail('`dependentId` is required', 400);

        const offset = (page - 1) * limit;
        const where = { enrolleeDependentId: dependentId };

        if (status) {
            where.status = status;
        }

        if (isUsed !== null) {
            where.isUsed = isUsed === 'true' || isUsed === true;
        }

        const { count, rows } = await AuthorizationCode.findAndCountAll({
            where,
            include: [
                { model: Provider, attributes: ['id', 'name', 'code'] },
                { model: Diagnosis, attributes: ['id', 'name'] }
            ],
            limit: parseInt(limit),
            offset: parseInt(offset),
            order: [['createdAt', 'DESC']],
            subQuery: false
        });

        return res.success(
            {
                authorizationCodes: rows,
                pagination: {
                    total: count,
                    page: parseInt(page),
                    limit: parseInt(limit),
                    pages: Math.ceil(count / limit)
                }
            },
            'Authorization codes retrieved successfully'
        );
    } catch (error) {
        console.error('Error fetching authorization codes:', error);
        next(error);
    }
}

async function getAuthorizationCodeById(req, res, next) {
    try {
        const { AuthorizationCode, Provider, Diagnosis } = req.models;
        const { dependentId, authorizationCodeId } = req.params;

        if (!dependentId) return res.fail('`dependentId` is required', 400);
        if (!authorizationCodeId) return res.fail('`authorizationCodeId` is required', 400);

        const authorizationCode = await AuthorizationCode.findOne({
            where: { id: authorizationCodeId, enrolleeDependentId: dependentId },
            include: [
                { model: Provider, attributes: ['id', 'name', 'code'] },
                { model: Diagnosis, attributes: ['id', 'name'] }
            ]
        });

        if (!authorizationCode) return res.fail('Authorization code not found', 404);

        return res.success(
            { authorizationCode },
            'Authorization code retrieved successfully'
        );
    } catch (error) {
        console.error('Error fetching authorization code:', error);
        next(error);
    }
}

async function useAuthorizationCode(req, res, next) {
    try {
        const { AuthorizationCode } = req.models;
        const { dependentId, authorizationCodeId } = req.params;
        const { amount = null, notes = null } = req.body || {};

        if (!dependentId) return res.fail('`dependentId` is required', 400);
        if (!authorizationCodeId) return res.fail('`authorizationCodeId` is required', 400);

        const authorizationCode = await AuthorizationCode.findOne({
            where: { id: authorizationCodeId, enrolleeDependentId: dependentId }
        });

        if (!authorizationCode) return res.fail('Authorization code not found', 404);
        if (authorizationCode.isUsed) return res.fail('Authorization code already used', 400);
        if (authorizationCode.status !== 'active') return res.fail('Authorization code is not active', 400);

        // Check if code has expired
        const now = new Date();
        if (now > authorizationCode.validTo) {
            return res.fail('Authorization code has expired', 400);
        }

        await authorizationCode.update({
            isUsed: true,
            usedAmount: amount,
            usedNotes: notes,
            usedAt: new Date()
        });

        // Add audit log
        await addAuditLog(req.models, {
            action: 'dependentAuthorizationCode.used',
            message: `Used authorization code ${authorizationCode.authorizationCode} for dependent ${dependentId}`,
            userId: req.user?.id,
            userType: 'admin'
        });

        return res.success(
            { authorizationCode },
            'Authorization code used successfully'
        );
    } catch (error) {
        console.error('Error using authorization code:', error);
        next(error);
    }
}

async function updateAuthorizationCode(req, res, next) {
    try {
        const { AuthorizationCode } = req.models;
        const { dependentId, authorizationCodeId } = req.params;
        const { validFrom, validTo, amountAuthorized, notes, status } = req.body || {};

        if (!dependentId) return res.fail('`dependentId` is required', 400);
        if (!authorizationCodeId) return res.fail('`authorizationCodeId` is required', 400);

        const authorizationCode = await AuthorizationCode.findOne({
            where: { id: authorizationCodeId, enrolleeDependentId: dependentId }
        });

        if (!authorizationCode) return res.fail('Authorization code not found', 404);

        await authorizationCode.update({
            validFrom: validFrom !== undefined ? new Date(validFrom) : authorizationCode.validFrom,
            validTo: validTo !== undefined ? new Date(validTo) : authorizationCode.validTo,
            amountAuthorized: amountAuthorized !== undefined ? amountAuthorized : authorizationCode.amountAuthorized,
            notes: notes !== undefined ? notes : authorizationCode.notes,
            status: status !== undefined ? status : authorizationCode.status
        });

        // Add audit log
        await addAuditLog(req.models, {
            action: 'dependentAuthorizationCode.updated',
            message: `Updated authorization code for dependent ${dependentId}`,
            userId: req.user?.id,
            userType: 'admin'
        });

        return res.success(
            { authorizationCode },
            'Authorization code updated successfully'
        );
    } catch (error) {
        console.error('Error updating authorization code:', error);
        next(error);
    }
}

async function cancelAuthorizationCode(req, res, next) {
    try {
        const { AuthorizationCode } = req.models;
        const { dependentId, authorizationCodeId } = req.params;
        const { reason = null } = req.body || {};

        if (!dependentId) return res.fail('`dependentId` is required', 400);
        if (!authorizationCodeId) return res.fail('`authorizationCodeId` is required', 400);

        const authorizationCode = await AuthorizationCode.findOne({
            where: { id: authorizationCodeId, enrolleeDependentId: dependentId }
        });

        if (!authorizationCode) return res.fail('Authorization code not found', 404);

        await authorizationCode.update({
            status: 'cancelled',
            cancelledAt: new Date(),
            cancelledReason: reason
        });

        // Add audit log
        await addAuditLog(req.models, {
            action: 'dependentAuthorizationCode.cancelled',
            message: `Cancelled authorization code for dependent ${dependentId}`,
            userId: req.user?.id,
            userType: 'admin'
        });

        return res.success(
            { authorizationCode },
            'Authorization code cancelled successfully'
        );
    } catch (error) {
        console.error('Error cancelling authorization code:', error);
        next(error);
    }
}

async function deleteAuthorizationCode(req, res, next) {
    try {
        const { AuthorizationCode } = req.models;
        const { dependentId, authorizationCodeId } = req.params;

        if (!dependentId) return res.fail('`dependentId` is required', 400);
        if (!authorizationCodeId) return res.fail('`authorizationCodeId` is required', 400);

        const authorizationCode = await AuthorizationCode.findOne({
            where: { id: authorizationCodeId, enrolleeDependentId: dependentId }
        });

        if (!authorizationCode) return res.fail('Authorization code not found', 404);

        await authorizationCode.destroy();

        // Add audit log
        await addAuditLog(req.models, {
            action: 'dependentAuthorizationCode.deleted',
            message: `Deleted authorization code for dependent ${dependentId}`,
            userId: req.user?.id,
            userType: 'admin'
        });

        return res.success(
            { authorizationCode },
            'Authorization code deleted successfully'
        );
    } catch (error) {
        console.error('Error deleting authorization code:', error);
        next(error);
    }
}

module.exports = {
    createAuthorizationCode,
    getAuthorizationCodes,
    getAuthorizationCodeById,
    useAuthorizationCode,
    updateAuthorizationCode,
    cancelAuthorizationCode,
    deleteAuthorizationCode
};
