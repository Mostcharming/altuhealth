const { Op } = require('sequelize');
const { addAuditLog } = require('../../../utils/addAdminNotification');
const { getUniqueAuthorizationCode } = require('../../../utils/authorizationCodeGenerator');

async function createRetailEnrolleeAuthorizationCode(req, res, next) {
    try {
        const { RetailEnrolleeAuthorizationCode, RetailEnrollee, Provider, Diagnosis } = req.models;
        const { retailEnrolleeId } = req.params;
        const {
            providerId,
            diagnosisId,
            authorizationType,
            validFrom,
            validTo,
            amountAuthorized,
            notes
        } = req.body || {};

        if (!retailEnrolleeId) return res.fail('`retailEnrolleeId` is required', 400);
        if (!authorizationType) return res.fail('`authorizationType` is required', 400);
        if (!validFrom) return res.fail('`validFrom` is required', 400);
        if (!validTo) return res.fail('`validTo` is required', 400);

        // Verify enrollee exists
        const enrollee = await RetailEnrollee.findByPk(retailEnrolleeId);
        if (!enrollee) return res.fail('Retail enrollee not found', 404);

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
        const authCode = await getUniqueAuthorizationCode(RetailEnrolleeAuthorizationCode);

        // Create authorization code record
        const authorizationCode = await RetailEnrolleeAuthorizationCode.create({
            retailEnrolleeId,
            authorizationCode: authCode,
            authorizationType,
            providerId: providerId || null,
            diagnosisId: diagnosisId || null,
            validFrom,
            validTo,
            amountAuthorized: amountAuthorized || null,
            notes: notes || null,
            status: 'active'
        });

        // Add audit log
        await addAuditLog(req.models, {
            action: 'retail_enrollee_authorization_code.create',
            message: `Created authorization code ${authCode} for retail enrollee ${retailEnrolleeId}`,
            userId: (req.user && req.user.id) ? req.user.id : null,
            userType: (req.user && req.user.type) ? req.user.type : null,
            meta: { authorizationCodeId: authorizationCode.id, retailEnrolleeId }
        });

        return res.success(
            { authorizationCode },
            'Authorization code created successfully',
            201
        );
    } catch (error) {
        return next(error);
    }
}

async function getRetailEnrolleeAuthorizationCodes(req, res, next) {
    try {
        const { RetailEnrolleeAuthorizationCode, Provider, Diagnosis } = req.models;
        const { retailEnrolleeId } = req.params;
        const { page = 1, limit = 20, status, search, sortBy = 'createdAt', sortOrder = 'DESC' } = req.query;

        const offset = (page - 1) * limit;
        const where = { retailEnrolleeId };

        if (status) where.status = status;
        if (search) {
            where[Op.or] = [
                { authorizationCode: { [Op.iLike]: `%${search}%` } },
                { authorizationType: { [Op.iLike]: `%${search}%` } }
            ];
        }

        const { count, rows } = await RetailEnrolleeAuthorizationCode.findAndCountAll({
            where,
            include: [
                { model: Provider, attributes: ['id', 'name'] },
                { model: Diagnosis, attributes: ['id', 'name'] }
            ],
            limit: parseInt(limit),
            offset,
            order: [[sortBy, sortOrder]],
            distinct: true
        });

        return res.success(
            {
                authorizationCodes: rows,
                pagination: {
                    total: count,
                    page: parseInt(page),
                    limit: parseInt(limit),
                    pages: Math.ceil(count / limit),
                    hasNextPage: offset + rows.length < count,
                    hasPreviousPage: page > 1
                }
            },
            'Authorization codes retrieved successfully'
        );
    } catch (error) {
        return next(error);
    }
}

async function getRetailEnrolleeAuthorizationCodeById(req, res, next) {
    try {
        const { RetailEnrolleeAuthorizationCode } = req.models;
        const { retailEnrolleeId, authorizationCodeId } = req.params;

        if (!retailEnrolleeId) return res.fail('`retailEnrolleeId` is required', 400);
        if (!authorizationCodeId) return res.fail('`authorizationCodeId` is required', 400);

        const authorizationCode = await RetailEnrolleeAuthorizationCode.findOne({
            where: { id: authorizationCodeId, retailEnrolleeId },
            include: [
                { model: Provider, attributes: ['id', 'name'] },
                { model: Diagnosis, attributes: ['id', 'name'] }
            ]
        });

        if (!authorizationCode) return res.fail('Authorization code not found', 404);

        return res.success({ authorizationCode }, 'Authorization code retrieved successfully');
    } catch (error) {
        return next(error);
    }
}

async function updateRetailEnrolleeAuthorizationCode(req, res, next) {
    try {
        const { RetailEnrolleeAuthorizationCode } = req.models;
        const { retailEnrolleeId, authorizationCodeId } = req.params;
        const { status, amountAuthorized, notes } = req.body || {};

        const authorizationCode = await RetailEnrolleeAuthorizationCode.findOne({
            where: { id: authorizationCodeId, retailEnrolleeId }
        });

        if (!authorizationCode) return res.fail('Authorization code not found', 404);

        const updates = {};
        if (status !== undefined) updates.status = status;
        if (amountAuthorized !== undefined) updates.amountAuthorized = amountAuthorized;
        if (notes !== undefined) updates.notes = notes;

        await authorizationCode.update(updates);

        // Add audit log
        await addAuditLog(req.models, {
            action: 'retail_enrollee_authorization_code.update',
            message: `Updated authorization code ${authorizationCode.authorizationCode}`,
            userId: (req.user && req.user.id) ? req.user.id : null,
            userType: (req.user && req.user.type) ? req.user.type : null,
            meta: { authorizationCodeId: authorizationCode.id }
        });

        return res.success({ authorizationCode }, 'Authorization code updated successfully');
    } catch (error) {
        return next(error);
    }
}

async function deleteRetailEnrolleeAuthorizationCode(req, res, next) {
    try {
        const { RetailEnrolleeAuthorizationCode } = req.models;
        const { retailEnrolleeId, authorizationCodeId } = req.params;

        const authorizationCode = await RetailEnrolleeAuthorizationCode.findOne({
            where: { id: authorizationCodeId, retailEnrolleeId }
        });

        if (!authorizationCode) return res.fail('Authorization code not found', 404);

        await authorizationCode.destroy();

        // Add audit log
        await addAuditLog(req.models, {
            action: 'retail_enrollee_authorization_code.delete',
            message: `Deleted authorization code ${authorizationCode.authorizationCode}`,
            userId: (req.user && req.user.id) ? req.user.id : null,
            userType: (req.user && req.user.type) ? req.user.type : null,
            meta: { authorizationCodeId }
        });

        return res.success(null, 'Authorization code deleted successfully');
    } catch (error) {
        return next(error);
    }
}

module.exports = {
    createRetailEnrolleeAuthorizationCode,
    getRetailEnrolleeAuthorizationCodes,
    getRetailEnrolleeAuthorizationCodeById,
    updateRetailEnrolleeAuthorizationCode,
    deleteRetailEnrolleeAuthorizationCode
};
