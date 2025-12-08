'use strict';

const { Op } = require('sequelize');
const { addAuditLog } = require('../../../utils/addAdminNotification');

async function createPaymentBatch(req, res, next) {
    try {
        const { PaymentBatch } = req.models;
        const {
            title,
            description,
            numberOfBatches,
            numberOfProviders,
            conflictCount,
            totalClaimsAmount,
            reconciliationAmount,
            paymentDate,
            dueDate,
            notes
        } = req.body || {};

        if (!title) return res.fail('`title` is required', 400);

        const paymentBatch = await PaymentBatch.create({
            title,
            description,
            numberOfBatches: numberOfBatches || 0,
            numberOfProviders: numberOfProviders || 0,
            conflictCount: conflictCount || 0,
            totalClaimsAmount: totalClaimsAmount || 0,
            reconciliationAmount: reconciliationAmount || 0,
            paymentDate: paymentDate || null,
            dueDate: dueDate || null,
            notes: notes || null,
            createdBy: (req.user && req.user.id) ? req.user.id : null,
            status: 'pending'
        });

        await addAuditLog(req.models, {
            action: 'paymentBatch.create',
            message: `Payment Batch ${paymentBatch.title} created`,
            userId: (req.user && req.user.id) ? req.user.id : null,
            userType: (req.user && req.user.type) ? req.user.type : null,
            meta: { paymentBatchId: paymentBatch.id }
        });

        return res.success({ paymentBatch: paymentBatch.toJSON() }, 'Payment Batch created', 201);
    } catch (err) {
        return next(err);
    }
}

async function updatePaymentBatch(req, res, next) {
    try {
        const { PaymentBatch } = req.models;
        const { id } = req.params;
        const {
            title,
            description,
            numberOfBatches,
            numberOfProviders,
            conflictCount,
            totalClaimsAmount,
            reconciliationAmount,
            status,
            isPaid,
            numberPaid,
            numberUnpaid,
            paidAmount,
            unpaidAmount,
            paymentDate,
            dueDate,
            notes,
            approvedBy,
            approvedDate,
            processingNotes
        } = req.body || {};

        const paymentBatch = await PaymentBatch.findByPk(id);
        if (!paymentBatch) return res.fail('Payment Batch not found', 404);

        const updates = {};
        if (title !== undefined) updates.title = title;
        if (description !== undefined) updates.description = description;
        if (numberOfBatches !== undefined) updates.numberOfBatches = numberOfBatches;
        if (numberOfProviders !== undefined) updates.numberOfProviders = numberOfProviders;
        if (conflictCount !== undefined) updates.conflictCount = conflictCount;
        if (totalClaimsAmount !== undefined) updates.totalClaimsAmount = totalClaimsAmount;
        if (reconciliationAmount !== undefined) updates.reconciliationAmount = reconciliationAmount;
        if (status !== undefined) updates.status = status;
        if (isPaid !== undefined) updates.isPaid = isPaid;
        if (numberPaid !== undefined) updates.numberPaid = numberPaid;
        if (numberUnpaid !== undefined) updates.numberUnpaid = numberUnpaid;
        if (paidAmount !== undefined) updates.paidAmount = paidAmount;
        if (unpaidAmount !== undefined) updates.unpaidAmount = unpaidAmount;
        if (paymentDate !== undefined) updates.paymentDate = paymentDate;
        if (dueDate !== undefined) updates.dueDate = dueDate;
        if (notes !== undefined) updates.notes = notes;
        if (approvedBy !== undefined) updates.approvedBy = approvedBy;
        if (approvedDate !== undefined) updates.approvedDate = approvedDate;
        if (processingNotes !== undefined) updates.processingNotes = processingNotes;

        // Always update updatedBy
        updates.updatedBy = (req.user && req.user.id) ? req.user.id : null;

        await paymentBatch.update(updates);

        await addAuditLog(req.models, {
            action: 'paymentBatch.update',
            message: `Payment Batch ${paymentBatch.title} updated`,
            userId: (req.user && req.user.id) ? req.user.id : null,
            userType: (req.user && req.user.type) ? req.user.type : null,
            meta: { paymentBatchId: paymentBatch.id }
        });

        return res.success({ paymentBatch }, 'Payment Batch updated');
    } catch (err) {
        return next(err);
    }
}

async function deletePaymentBatch(req, res, next) {
    try {
        const { PaymentBatch } = req.models;
        const { id } = req.params;

        const paymentBatch = await PaymentBatch.findByPk(id);
        if (!paymentBatch) return res.fail('Payment Batch not found', 404);

        await paymentBatch.destroy();

        await addAuditLog(req.models, {
            action: 'paymentBatch.delete',
            message: `Payment Batch ${paymentBatch.title} deleted`,
            userId: (req.user && req.user.id) ? req.user.id : null,
            userType: (req.user && req.user.type) ? req.user.type : null,
            meta: { paymentBatchId: id }
        });

        return res.success(null, 'Payment Batch deleted');
    } catch (err) {
        return next(err);
    }
}

async function listPaymentBatches(req, res, next) {
    try {
        const { PaymentBatch } = req.models;
        const { limit = 10, page = 1, q, status } = req.query;

        const isAll = String(limit).toLowerCase() === 'all';
        const limitNum = isAll ? 0 : Number(limit);
        const pageNum = isAll ? 1 : (Number(page) || 1);
        const offset = isAll ? 0 : (pageNum - 1) * limitNum;

        const where = {};
        if (q) {
            where[Op.or] = [
                { title: { [Op.iLike || Op.like]: `%${q}%` } },
                { description: { [Op.iLike || Op.like]: `%${q}%` } }
            ];
        }
        if (status) {
            where.status = status;
        }

        const total = await PaymentBatch.count({ where });

        const findOptions = {
            where,
            order: [['created_at', 'DESC']]
        };

        if (!isAll) {
            findOptions.limit = limitNum;
            findOptions.offset = Number(offset);
        }

        const paymentBatches = await PaymentBatch.findAll(findOptions);
        const data = paymentBatches.map(pb => pb.toJSON());

        const hasPrevPage = !isAll && pageNum > 1;
        const hasNextPage = !isAll && (offset + paymentBatches.length < total);
        const totalPages = isAll ? 1 : (limitNum > 0 ? Math.ceil(total / limitNum) : 1);

        return res.success({
            list: data,
            count: total,
            page: pageNum,
            limit: isAll ? 'all' : limitNum,
            totalPages,
            hasNextPage,
            hasPrevPage
        });
    } catch (err) {
        return next(err);
    }
}

async function getPaymentBatch(req, res, next) {
    try {
        const { PaymentBatch } = req.models;
        const { id } = req.params;

        const paymentBatch = await PaymentBatch.findByPk(id);
        if (!paymentBatch) return res.fail('Payment Batch not found', 404);

        return res.success(paymentBatch.toJSON());
    } catch (err) {
        return next(err);
    }
}

async function getPaymentBatchWithDetails(req, res, next) {
    try {
        const { PaymentBatch, PaymentBatchDetail } = req.models;
        const { id } = req.params;

        const paymentBatch = await PaymentBatch.findByPk(id, {
            include: [{
                model: PaymentBatchDetail,
                as: 'details'
            }]
        });

        if (!paymentBatch) return res.fail('Payment Batch not found', 404);

        return res.success(paymentBatch.toJSON());
    } catch (err) {
        return next(err);
    }
}

// Payment Batch Details

async function addBatchDetail(req, res, next) {
    try {
        const { PaymentBatchDetail, PaymentBatch, Provider } = req.models;
        const { paymentBatchId } = req.params;
        const {
            providerId,
            period,
            claimsCount,
            reconciliationCount,
            reconciliationAmount,
            claimsAmount,
            paymentStatus,
            notes
        } = req.body || {};

        if (!providerId) return res.fail('`providerId` is required', 400);
        if (!period) return res.fail('`period` is required', 400);

        // Verify payment batch exists
        const paymentBatch = await PaymentBatch.findByPk(paymentBatchId);
        if (!paymentBatch) return res.fail('Payment Batch not found', 404);

        // Verify provider exists
        const provider = await Provider.findByPk(providerId);
        if (!provider) return res.fail('Provider not found', 404);

        // Check if detail already exists for this provider in this batch
        const existing = await PaymentBatchDetail.findOne({
            where: { paymentBatchId, providerId }
        });
        if (existing) return res.fail('Detail already exists for this provider in this batch', 400);

        const detail = await PaymentBatchDetail.create({
            paymentBatchId,
            providerId,
            period,
            claimsCount: claimsCount || 0,
            reconciliationCount: reconciliationCount || 0,
            reconciliationAmount: reconciliationAmount || 0,
            claimsAmount: claimsAmount || 0,
            paymentStatus: paymentStatus || 'pending',
            notes: notes || null
        });

        await addAuditLog(req.models, {
            action: 'paymentBatchDetail.create',
            message: `Payment Batch Detail added for provider ${provider.name}`,
            userId: (req.user && req.user.id) ? req.user.id : null,
            userType: (req.user && req.user.type) ? req.user.type : null,
            meta: { paymentBatchDetailId: detail.id, paymentBatchId, providerId }
        });

        return res.success({ detail: detail.toJSON() }, 'Batch Detail added', 201);
    } catch (err) {
        return next(err);
    }
}

async function updateBatchDetail(req, res, next) {
    try {
        const { PaymentBatchDetail } = req.models;
        const { detailId } = req.params;
        const {
            period,
            claimsCount,
            reconciliationCount,
            reconciliationAmount,
            claimsAmount,
            paymentStatus,
            notes
        } = req.body || {};

        const detail = await PaymentBatchDetail.findByPk(detailId);
        if (!detail) return res.fail('Batch Detail not found', 404);

        const updates = {};
        if (period !== undefined) updates.period = period;
        if (claimsCount !== undefined) updates.claimsCount = claimsCount;
        if (reconciliationCount !== undefined) updates.reconciliationCount = reconciliationCount;
        if (reconciliationAmount !== undefined) updates.reconciliationAmount = reconciliationAmount;
        if (claimsAmount !== undefined) updates.claimsAmount = claimsAmount;
        if (paymentStatus !== undefined) updates.paymentStatus = paymentStatus;
        if (notes !== undefined) updates.notes = notes;

        await detail.update(updates);

        await addAuditLog(req.models, {
            action: 'paymentBatchDetail.update',
            message: `Payment Batch Detail ${detail.id} updated`,
            userId: (req.user && req.user.id) ? req.user.id : null,
            userType: (req.user && req.user.type) ? req.user.type : null,
            meta: { paymentBatchDetailId: detail.id }
        });

        return res.success({ detail }, 'Batch Detail updated');
    } catch (err) {
        return next(err);
    }
}

async function deleteBatchDetail(req, res, next) {
    try {
        const { PaymentBatchDetail } = req.models;
        const { detailId } = req.params;

        const detail = await PaymentBatchDetail.findByPk(detailId);
        if (!detail) return res.fail('Batch Detail not found', 404);

        await detail.destroy();

        await addAuditLog(req.models, {
            action: 'paymentBatchDetail.delete',
            message: `Payment Batch Detail ${detail.id} deleted`,
            userId: (req.user && req.user.id) ? req.user.id : null,
            userType: (req.user && req.user.type) ? req.user.type : null,
            meta: { paymentBatchDetailId: detailId }
        });

        return res.success(null, 'Batch Detail deleted');
    } catch (err) {
        return next(err);
    }
}

async function listBatchDetails(req, res, next) {
    try {
        const { PaymentBatchDetail } = req.models;
        const { paymentBatchId } = req.params;
        const { limit = 10, page = 1 } = req.query;

        const isAll = String(limit).toLowerCase() === 'all';
        const limitNum = isAll ? 0 : Number(limit);
        const pageNum = isAll ? 1 : (Number(page) || 1);
        const offset = isAll ? 0 : (pageNum - 1) * limitNum;

        const where = { paymentBatchId };

        const total = await PaymentBatchDetail.count({ where });

        const findOptions = {
            where,
            include: [{
                model: req.models.Provider,
                attributes: ['id', 'name', 'email', 'phoneNumber']
            }],
            order: [['created_at', 'DESC']]
        };

        if (!isAll) {
            findOptions.limit = limitNum;
            findOptions.offset = Number(offset);
        }

        const details = await PaymentBatchDetail.findAll(findOptions);
        const data = details.map(d => d.toJSON());

        const hasPrevPage = !isAll && pageNum > 1;
        const hasNextPage = !isAll && (offset + details.length < total);
        const totalPages = isAll ? 1 : (limitNum > 0 ? Math.ceil(total / limitNum) : 1);

        return res.success({
            list: data,
            count: total,
            page: pageNum,
            limit: isAll ? 'all' : limitNum,
            totalPages,
            hasNextPage,
            hasPrevPage
        });
    } catch (err) {
        return next(err);
    }
}

async function getBatchDetail(req, res, next) {
    try {
        const { PaymentBatchDetail } = req.models;
        const { detailId } = req.params;

        const detail = await PaymentBatchDetail.findByPk(detailId, {
            include: [{
                model: req.models.Provider,
                attributes: ['id', 'name', 'email', 'phoneNumber', 'accountNumber']
            }]
        });

        if (!detail) return res.fail('Batch Detail not found', 404);

        return res.success(detail.toJSON());
    } catch (err) {
        return next(err);
    }
}

module.exports = {
    // Payment Batch
    createPaymentBatch,
    updatePaymentBatch,
    deletePaymentBatch,
    listPaymentBatches,
    getPaymentBatch,
    getPaymentBatchWithDetails,
    // Payment Batch Details
    addBatchDetail,
    updateBatchDetail,
    deleteBatchDetail,
    listBatchDetails,
    getBatchDetail
};
