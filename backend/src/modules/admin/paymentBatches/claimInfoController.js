'use strict';

const { Op } = require('sequelize');
const { addAuditLog } = require('../../../utils/addAdminNotification');

async function getClaimsByPaymentBatchDetail(req, res, next) {
    try {
        const { ClaimInfo } = req.models;
        const { paymentBatchDetailId } = req.params;
        const { limit = 10, page = 1, status, q } = req.query;

        if (!paymentBatchDetailId) {
            return res.fail('paymentBatchDetailId is required', 400);
        }

        const isAll = String(limit).toLowerCase() === 'all';
        const limitNum = isAll ? 0 : Number(limit);
        const pageNum = isAll ? 1 : (Number(page) || 1);
        const offset = isAll ? 0 : (pageNum - 1) * limitNum;

        const where = { paymentBatchDetailId };

        // Add optional filters
        if (status) {
            where.status = status;
        }
        if (q) {
            where[Op.or] = [
                { claimNumber: { [Op.iLike || Op.like]: `%${q}%` } },
                { description: { [Op.iLike || Op.like]: `%${q}%` } }
            ];
        }

        const total = await ClaimInfo.count({ where });

        const findOptions = {
            where,
            include: [
                {
                    model: req.models.PaymentBatchDetail,
                    attributes: ['id', 'period', 'claimsCount', 'claimsAmount', 'paymentStatus']
                },
                {
                    model: req.models.Enrollee,
                    attributes: ['id', 'firstName', 'lastName', 'policyNumber', 'email']
                }
            ],
            order: [['created_at', 'DESC']]
        };

        if (!isAll) {
            findOptions.limit = limitNum;
            findOptions.offset = Number(offset);
        }

        const claims = await ClaimInfo.findAll(findOptions);
        const data = claims.map(c => c.toJSON());

        const hasPrevPage = !isAll && pageNum > 1;
        const hasNextPage = !isAll && (offset + claims.length < total);
        const totalPages = isAll ? 1 : (limitNum > 0 ? Math.ceil(total / limitNum) : 1);

        await addAuditLog(req.models, {
            action: 'claimInfo.list',
            message: `Claims retrieved for payment batch detail ${paymentBatchDetailId}`,
            userId: (req.user && req.user.id) ? req.user.id : null,
            userType: (req.user && req.user.type) ? req.user.type : null,
            meta: { paymentBatchDetailId }
        });

        return res.success({
            list: data,
            count: total,
            page: pageNum,
            limit: isAll ? 'all' : limitNum,
            totalPages,
            hasNextPage,
            hasPrevPage
        }, 'Claims retrieved successfully');
    } catch (err) {
        return next(err);
    }
}

async function getClaimDetail(req, res, next) {
    try {
        const { ClaimInfo } = req.models;
        const { claimId } = req.params;

        if (!claimId) {
            return res.fail('claimId is required', 400);
        }

        const claim = await ClaimInfo.findByPk(claimId, {
            include: [
                {
                    model: req.models.PaymentBatchDetail,
                    attributes: ['id', 'period', 'claimsCount', 'claimsAmount', 'paymentStatus']
                },
                {
                    model: req.models.Enrollee,
                    attributes: ['id', 'firstName', 'lastName', 'policyNumber', 'email', 'companyId']
                }
            ]
        });

        if (!claim) {
            return res.fail('Claim not found', 404);
        }

        await addAuditLog(req.models, {
            action: 'claimInfo.get',
            message: `Claim ${claimId} retrieved`,
            userId: (req.user && req.user.id) ? req.user.id : null,
            userType: (req.user && req.user.type) ? req.user.type : null,
            meta: { claimId }
        });

        return res.success({ claim: claim.toJSON() }, 'Claim retrieved successfully');
    } catch (err) {
        return next(err);
    }
}

async function createClaim(req, res, next) {
    try {
        const { ClaimInfo } = req.models;
        const { paymentBatchDetailId, enrolleeId, claimNumber, serviceDate, claimAmount, approvedAmount, status, serviceType, description, notes } = req.body || {};

        if (!paymentBatchDetailId || !enrolleeId || !claimNumber) {
            return res.fail('paymentBatchDetailId, enrolleeId, and claimNumber are required', 400);
        }

        const claim = await ClaimInfo.create({
            paymentBatchDetailId,
            enrolleeId,
            claimNumber,
            serviceDate: serviceDate || new Date(),
            claimAmount: claimAmount || 0,
            approvedAmount: approvedAmount || 0,
            status: status || 'pending',
            serviceType: serviceType || null,
            description: description || null,
            notes: notes || null
        });

        await addAuditLog(req.models, {
            action: 'claimInfo.create',
            message: `Claim ${claimNumber} created for enrollee ${enrolleeId}`,
            userId: (req.user && req.user.id) ? req.user.id : null,
            userType: (req.user && req.user.type) ? req.user.type : null,
            meta: { claimId: claim.id, claimNumber }
        });

        return res.success({ claim: claim.toJSON() }, 'Claim created successfully', 201);
    } catch (err) {
        return next(err);
    }
}

async function updateClaim(req, res, next) {
    try {
        const { ClaimInfo } = req.models;
        const { claimId } = req.params;
        const { claimAmount, approvedAmount, status, serviceType, description, notes } = req.body || {};

        const claim = await ClaimInfo.findByPk(claimId);
        if (!claim) {
            return res.fail('Claim not found', 404);
        }

        const updates = {};
        if (claimAmount !== undefined) updates.claimAmount = claimAmount;
        if (approvedAmount !== undefined) updates.approvedAmount = approvedAmount;
        if (status !== undefined) updates.status = status;
        if (serviceType !== undefined) updates.serviceType = serviceType;
        if (description !== undefined) updates.description = description;
        if (notes !== undefined) updates.notes = notes;

        await claim.update(updates);

        await addAuditLog(req.models, {
            action: 'claimInfo.update',
            message: `Claim ${claim.claimNumber} updated`,
            userId: (req.user && req.user.id) ? req.user.id : null,
            userType: (req.user && req.user.type) ? req.user.type : null,
            meta: { claimId }
        });

        return res.success({ claim: claim.toJSON() }, 'Claim updated successfully');
    } catch (err) {
        return next(err);
    }
}

async function deleteClaim(req, res, next) {
    try {
        const { ClaimInfo } = req.models;
        const { claimId } = req.params;

        const claim = await ClaimInfo.findByPk(claimId);
        if (!claim) {
            return res.fail('Claim not found', 404);
        }

        const claimNumber = claim.claimNumber;
        await claim.destroy();

        await addAuditLog(req.models, {
            action: 'claimInfo.delete',
            message: `Claim ${claimNumber} deleted`,
            userId: (req.user && req.user.id) ? req.user.id : null,
            userType: (req.user && req.user.type) ? req.user.type : null,
            meta: { claimId }
        });

        return res.success(null, 'Claim deleted successfully');
    } catch (err) {
        return next(err);
    }
}

module.exports = {
    getClaimsByPaymentBatchDetail,
    getClaimDetail,
    createClaim,
    updateClaim,
    deleteClaim
};
