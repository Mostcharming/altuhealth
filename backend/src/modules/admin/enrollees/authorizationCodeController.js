const { Op } = require('sequelize');
const { addAuditLog } = require('../../../utils/addAdminNotification');
const { getUniqueAuthorizationCode } = require('../../../utils/authorizationCodeGenerator');

async function createAuthorizationCode(req, res, next) {
    try {
        const { AuthorizationCode, Enrollee, Provider, Diagnosis } = req.models;
        const { enrolleeId } = req.params;
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

        if (!enrolleeId) return res.fail('`enrolleeId` is required', 400);
        if (!authorizationType) return res.fail('`authorizationType` is required', 400);
        if (!validFrom) return res.fail('`validFrom` is required', 400);
        if (!validTo) return res.fail('`validTo` is required', 400);

        // Verify enrollee exists
        const enrollee = await Enrollee.findByPk(enrolleeId);
        if (!enrollee) return res.fail('Enrollee not found', 404);

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
            enrolleeId,
            providerId: providerId || null,
            diagnosisId: diagnosisId || null,
            reason: reason || null,
            authorizationType,
            validFrom: new Date(validFrom),
            validTo: new Date(validTo),
            amountAuthorized: amountAuthorized || null,
            status: 'active',
            notes: notes || null
        });

        // Add audit log
        await addAuditLog(req.models, {
            action: 'authorizationCode.created',
            message: `Created authorization code ${authCode} for enrollee ${enrolleeId}`,
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
        const { enrolleeId } = req.params;
        const { page = 1, limit = 10, status = null, isUsed = null } = req.query;

        if (!enrolleeId) return res.fail('`enrolleeId` is required', 400);

        const offset = (page - 1) * limit;
        const where = { enrolleeId };

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
                { model: Diagnosis, attributes: ['id', 'name', 'code'] }
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
        const { enrolleeId, authorizationCodeId } = req.params;

        if (!enrolleeId) return res.fail('`enrolleeId` is required', 400);
        if (!authorizationCodeId) return res.fail('`authorizationCodeId` is required', 400);

        const authorizationCode = await AuthorizationCode.findOne({
            where: { id: authorizationCodeId, enrolleeId },
            include: [
                { model: Provider, attributes: ['id', 'name', 'code'] },
                { model: Diagnosis, attributes: ['id', 'name', 'code'] }
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
        const { enrolleeId, authorizationCodeId } = req.params;
        const { usedAmount } = req.body || {};

        if (!enrolleeId) return res.fail('`enrolleeId` is required', 400);
        if (!authorizationCodeId) return res.fail('`authorizationCodeId` is required', 400);

        // Find authorization code
        const authorizationCode = await AuthorizationCode.findOne({
            where: { id: authorizationCodeId, enrolleeId }
        });
        if (!authorizationCode) return res.fail('Authorization code not found', 404);

        // Check if code is already used
        if (authorizationCode.isUsed) {
            return res.fail('Authorization code has already been used', 400);
        }

        // Check if code is expired
        const now = new Date();
        if (now > authorizationCode.validTo) {
            await authorizationCode.update({ status: 'expired' });
            return res.fail('Authorization code has expired', 400);
        }

        // Check if amount is within authorized limit
        if (authorizationCode.amountAuthorized && usedAmount && usedAmount > authorizationCode.amountAuthorized) {
            return res.fail('Used amount exceeds authorized amount', 400);
        }

        // Mark authorization code as used
        await authorizationCode.update({
            isUsed: true,
            usedAt: new Date(),
            usedAmount: usedAmount || authorizationCode.amountAuthorized,
            status: 'used'
        });

        // Add audit log
        await addAuditLog(req.models, {
            action: 'authorizationCode.used',
            message: `Marked authorization code ${authorizationCode.authorizationCode} as used for enrollee ${enrolleeId}`,
            userId: req.user?.id,
            userType: 'admin'
        });

        return res.success(
            { authorizationCode },
            'Authorization code marked as used successfully'
        );
    } catch (error) {
        console.error('Error using authorization code:', error);
        next(error);
    }
}

async function updateAuthorizationCode(req, res, next) {
    try {
        const { AuthorizationCode, Provider, Diagnosis } = req.models;
        const { enrolleeId, authorizationCodeId } = req.params;
        const updates = req.body || {};

        if (!enrolleeId) return res.fail('`enrolleeId` is required', 400);
        if (!authorizationCodeId) return res.fail('`authorizationCodeId` is required', 400);

        // Find authorization code
        const authorizationCode = await AuthorizationCode.findOne({
            where: { id: authorizationCodeId, enrolleeId }
        });
        if (!authorizationCode) return res.fail('Authorization code not found', 404);

        // Verify provider exists if being updated
        if (updates.providerId && updates.providerId !== authorizationCode.providerId) {
            const provider = await Provider.findByPk(updates.providerId);
            if (!provider) return res.fail('Provider not found', 404);
        }

        // Verify diagnosis exists if being updated
        if (updates.diagnosisId && updates.diagnosisId !== authorizationCode.diagnosisId) {
            const diagnosis = await Diagnosis.findByPk(updates.diagnosisId);
            if (!diagnosis) return res.fail('Diagnosis not found', 404);
        }

        // Update authorization code
        await authorizationCode.update(updates);

        // Add audit log
        await addAuditLog(req.models, {
            action: 'authorizationCode.updated',
            message: `Updated authorization code ${authorizationCode.authorizationCode} for enrollee ${enrolleeId}`,
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
        const { enrolleeId, authorizationCodeId } = req.params;

        if (!enrolleeId) return res.fail('`enrolleeId` is required', 400);
        if (!authorizationCodeId) return res.fail('`authorizationCodeId` is required', 400);

        // Find authorization code
        const authorizationCode = await AuthorizationCode.findOne({
            where: { id: authorizationCodeId, enrolleeId }
        });
        if (!authorizationCode) return res.fail('Authorization code not found', 404);

        // Check if code is already used
        if (authorizationCode.isUsed) {
            return res.fail('Cannot cancel an already used authorization code', 400);
        }

        // Update status to cancelled
        await authorizationCode.update({ status: 'cancelled' });

        // Add audit log
        await addAuditLog(req.models, {
            action: 'authorizationCode.cancelled',
            message: `Cancelled authorization code ${authorizationCode.authorizationCode} for enrollee ${enrolleeId}`,
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
        const { enrolleeId, authorizationCodeId } = req.params;

        if (!enrolleeId) return res.fail('`enrolleeId` is required', 400);
        if (!authorizationCodeId) return res.fail('`authorizationCodeId` is required', 400);

        // Find and delete authorization code
        const authorizationCode = await AuthorizationCode.findOne({
            where: { id: authorizationCodeId, enrolleeId }
        });
        if (!authorizationCode) return res.fail('Authorization code not found', 404);

        await authorizationCode.destroy();

        // Add audit log
        await addAuditLog(req.models, {
            action: 'authorization.deleted',
            message: `Deleted authorization code ${authorizationCode.authorizationCode} for enrollee ${enrolleeId}`,
            userId: req.user?.id,
            userType: 'admin'
        });

        return res.success(
            null,
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
