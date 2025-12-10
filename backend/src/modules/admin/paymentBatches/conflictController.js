'use strict';

const { Op } = require('sequelize');
const { addAuditLog } = require('../../../utils/addAdminNotification');

async function getConflictsByPaymentBatchDetail(req, res, next) {
    try {
        const { Conflict } = req.models;
        const { paymentBatchDetailId } = req.params;
        const { limit = 10, page = 1, status, conflictType, q } = req.query;

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
        if (conflictType) {
            where.conflictType = conflictType;
        }
        if (q) {
            where[Op.or] = [
                { claimNumber: { [Op.iLike || Op.like]: `%${q}%` } },
                { description: { [Op.iLike || Op.like]: `%${q}%` } }
            ];
        }

        const total = await Conflict.count({ where });

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
                },
                {
                    model: req.models.Admin,
                    as: 'assignedAdmin',
                    attributes: ['id', 'firstName', 'lastName', 'email']
                }
            ],
            order: [['created_at', 'DESC']]
        };

        if (!isAll) {
            findOptions.limit = limitNum;
            findOptions.offset = Number(offset);
        }

        const conflicts = await Conflict.findAll(findOptions);
        const data = conflicts.map(c => c.toJSON());

        const hasPrevPage = !isAll && pageNum > 1;
        const hasNextPage = !isAll && (offset + conflicts.length < total);
        const totalPages = isAll ? 1 : (limitNum > 0 ? Math.ceil(total / limitNum) : 1);

        await addAuditLog(req.models, {
            action: 'conflict.list',
            message: `Conflicts retrieved for payment batch detail ${paymentBatchDetailId}`,
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
        }, 'Conflicts retrieved successfully');
    } catch (err) {
        return next(err);
    }
}

async function getConflictDetail(req, res, next) {
    try {
        const { Conflict } = req.models;
        const { conflictId } = req.params;

        if (!conflictId) {
            return res.fail('conflictId is required', 400);
        }

        const conflict = await Conflict.findByPk(conflictId, {
            include: [
                {
                    model: req.models.PaymentBatchDetail,
                    attributes: ['id', 'period', 'claimsCount', 'claimsAmount', 'paymentStatus']
                },
                {
                    model: req.models.Enrollee,
                    attributes: ['id', 'firstName', 'lastName', 'policyNumber', 'email', 'companyId']
                },
                {
                    model: req.models.Admin,
                    as: 'assignedAdmin',
                    attributes: ['id', 'firstName', 'lastName', 'email']
                }
            ]
        });

        if (!conflict) {
            return res.fail('Conflict not found', 404);
        }

        await addAuditLog(req.models, {
            action: 'conflict.get',
            message: `Conflict ${conflictId} retrieved`,
            userId: (req.user && req.user.id) ? req.user.id : null,
            userType: (req.user && req.user.type) ? req.user.type : null,
            meta: { conflictId }
        });

        return res.success({ conflict: conflict.toJSON() }, 'Conflict retrieved successfully');
    } catch (err) {
        return next(err);
    }
}

async function createConflict(req, res, next) {
    try {
        const { Conflict } = req.models;
        const {
            paymentBatchDetailId,
            enrolleeId,
            claimNumber,
            conflictType,
            description,
            claimedAmount,
            resolvedAmount,
            resolutionComment,
            status,
            assignedTo,
            notes
        } = req.body || {};

        if (!paymentBatchDetailId || !enrolleeId || !claimNumber || !conflictType || !description) {
            return res.fail('paymentBatchDetailId, enrolleeId, claimNumber, conflictType, and description are required', 400);
        }

        const conflict = await Conflict.create({
            paymentBatchDetailId,
            enrolleeId,
            claimNumber,
            conflictType,
            description,
            claimedAmount: claimedAmount || 0,
            resolvedAmount: resolvedAmount || 0,
            resolutionComment: resolutionComment || null,
            status: status || 'open',
            assignedTo: assignedTo || null,
            notes: notes || null
        });

        await addAuditLog(req.models, {
            action: 'conflict.create',
            message: `Conflict created for claim ${claimNumber} with type ${conflictType}`,
            userId: (req.user && req.user.id) ? req.user.id : null,
            userType: (req.user && req.user.type) ? req.user.type : null,
            meta: { conflictId: conflict.id, claimNumber, conflictType }
        });

        return res.success({ conflict: conflict.toJSON() }, 'Conflict created successfully', 201);
    } catch (err) {
        return next(err);
    }
}

async function updateConflict(req, res, next) {
    try {
        const { Conflict } = req.models;
        const { conflictId } = req.params;
        const {
            conflictType,
            description,
            claimedAmount,
            resolvedAmount,
            resolutionComment,
            status,
            assignedTo,
            resolvedDate,
            notes
        } = req.body || {};

        const conflict = await Conflict.findByPk(conflictId);
        if (!conflict) {
            return res.fail('Conflict not found', 404);
        }

        const updates = {};
        if (conflictType !== undefined) updates.conflictType = conflictType;
        if (description !== undefined) updates.description = description;
        if (claimedAmount !== undefined) updates.claimedAmount = claimedAmount;
        if (resolvedAmount !== undefined) updates.resolvedAmount = resolvedAmount;
        if (resolutionComment !== undefined) updates.resolutionComment = resolutionComment;
        if (status !== undefined) updates.status = status;
        if (assignedTo !== undefined) updates.assignedTo = assignedTo;
        if (resolvedDate !== undefined) updates.resolvedDate = resolvedDate;
        if (notes !== undefined) updates.notes = notes;

        await conflict.update(updates);

        await addAuditLog(req.models, {
            action: 'conflict.update',
            message: `Conflict ${conflictId} updated with status ${conflict.status}`,
            userId: (req.user && req.user.id) ? req.user.id : null,
            userType: (req.user && req.user.type) ? req.user.type : null,
            meta: { conflictId }
        });

        return res.success({ conflict: conflict.toJSON() }, 'Conflict updated successfully');
    } catch (err) {
        return next(err);
    }
}

async function resolveConflict(req, res, next) {
    try {
        const { Conflict } = req.models;
        const { conflictId } = req.params;
        const { resolvedAmount, resolutionComment, assignedTo } = req.body || {};

        const conflict = await Conflict.findByPk(conflictId);
        if (!conflict) {
            return res.fail('Conflict not found', 404);
        }

        const updates = {
            status: 'resolved',
            resolvedDate: new Date()
        };

        if (resolvedAmount !== undefined) updates.resolvedAmount = resolvedAmount;
        if (resolutionComment !== undefined) updates.resolutionComment = resolutionComment;
        if (assignedTo !== undefined) updates.assignedTo = assignedTo;

        await conflict.update(updates);

        await addAuditLog(req.models, {
            action: 'conflict.resolve',
            message: `Conflict ${conflictId} resolved with amount ${updates.resolvedAmount}`,
            userId: (req.user && req.user.id) ? req.user.id : null,
            userType: (req.user && req.user.type) ? req.user.type : null,
            meta: { conflictId, resolvedAmount: updates.resolvedAmount }
        });

        return res.success({ conflict: conflict.toJSON() }, 'Conflict resolved successfully');
    } catch (err) {
        return next(err);
    }
}

async function deleteConflict(req, res, next) {
    try {
        const { Conflict } = req.models;
        const { conflictId } = req.params;

        const conflict = await Conflict.findByPk(conflictId);
        if (!conflict) {
            return res.fail('Conflict not found', 404);
        }

        const claimNumber = conflict.claimNumber;
        await conflict.destroy();

        await addAuditLog(req.models, {
            action: 'conflict.delete',
            message: `Conflict for claim ${claimNumber} deleted`,
            userId: (req.user && req.user.id) ? req.user.id : null,
            userType: (req.user && req.user.type) ? req.user.type : null,
            meta: { conflictId }
        });

        return res.success(null, 'Conflict deleted successfully');
    } catch (err) {
        return next(err);
    }
}

module.exports = {
    getConflictsByPaymentBatchDetail,
    getConflictDetail,
    createConflict,
    updateConflict,
    resolveConflict,
    deleteConflict
};
