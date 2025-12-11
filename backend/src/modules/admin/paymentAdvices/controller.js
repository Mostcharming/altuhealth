'use strict';

const { Op } = require('sequelize');
const { addAuditLog } = require('../../../utils/addAdminNotification');

// Helper function to generate payment advice number
async function generatePaymentAdviceNumber(PaymentAdvice) {
    const count = await PaymentAdvice.count();
    const date = new Date();
    const timestamp = date.getFullYear().toString().slice(-2) +
        String(date.getMonth() + 1).padStart(2, '0') +
        String(date.getDate()).padStart(2, '0');
    return `AHL-PAY-${timestamp}-${String(count + 1).padStart(5, '0')}`;
}

async function createPaymentAdvice(req, res, next) {
    try {
        const { PaymentAdvice, Provider } = req.models;
        const {
            providerId,
            paymentBatchId,
            totalAmount,
            numberOfClaims,
            paymentDate,
            dueDate,
            paymentMethod = 'bank_transfer',
            bankName,
            bankAccountNumber,
            accountName,
            accountType,
            sortCode,
            routingNumber,
            description,
            notes
        } = req.body || {};

        if (!providerId) return res.fail('`providerId` is required', 400);
        if (!paymentDate) return res.fail('`paymentDate` is required', 400);
        if (totalAmount === undefined || totalAmount === null) return res.fail('`totalAmount` is required', 400);

        // Verify provider exists
        const provider = await Provider.findByPk(providerId);
        if (!provider) return res.fail('Provider not found', 404);

        // Generate unique payment advice number
        const paymentAdviceNumber = await generatePaymentAdviceNumber(PaymentAdvice);

        const paymentAdvice = await PaymentAdvice.create({
            paymentAdviceNumber,
            providerId,
            paymentBatchId: paymentBatchId || null,
            totalAmount,
            numberOfClaims: numberOfClaims || 0,
            paymentDate,
            dueDate: dueDate || null,
            paymentMethod,
            bankName: bankName || null,
            bankAccountNumber: bankAccountNumber || null,
            accountName: accountName || null,
            accountType: accountType || null,
            sortCode: sortCode || null,
            routingNumber: routingNumber || null,
            description: description || null,
            notes: notes || null,
            createdBy: (req.user && req.user.id) ? req.user.id : null,
            status: 'draft'
        });

        // Add audit log
        await addAuditLog(req.models, {


            action: 'paymentAdvise.create',
            message: 'Payment Advice created',
            userId: (req.user && req.user.id) ? req.user.id : null,
            userType: (req.user && req.user.type) ? req.user.type : null,
            meta: { paymentAdiceId: paymentAdvice.id, providerId }
        });

        res.success({ paymentAdvice }, 'Payment Advice created successfully', 201);
    } catch (error) {
        next(error);
    }
}

async function listPaymentAdvices(req, res, next) {
    try {
        const { PaymentAdvice, Provider } = req.models;
        const {
            page = 1,
            limit = 10,
            status,
            providerId,
            sortBy = 'createdAt',
            sortOrder = 'DESC'
        } = req.query;

        const offset = (page - 1) * limit;
        const where = {};

        if (status) where.status = status;
        if (providerId) where.providerId = providerId;

        const { count, rows } = await PaymentAdvice.findAndCountAll({
            where,
            include: [
                {
                    model: Provider,
                    as: 'provider',
                    attributes: ['id', 'name', 'code']
                }
            ],
            offset,
            limit: parseInt(limit),
            order: [[sortBy, sortOrder]],
            distinct: true
        });

        res.success({
            paymentAdvices: rows,
            pagination: {
                total: count,
                page: parseInt(page),
                limit: parseInt(limit),
                pages: Math.ceil(count / limit)
            }
        }, 'Payment Advices retrieved successfully');
    } catch (error) {
        next(error);
    }
}

async function getPaymentAdvice(req, res, next) {
    try {
        const { PaymentAdvice, Provider } = req.models;
        const { id } = req.params;

        const paymentAdvice = await PaymentAdvice.findByPk(id, {
            include: [
                {
                    model: Provider,
                    as: 'provider',
                    attributes: ['id', 'name', 'code', 'email', 'phoneNumber']
                }
            ]
        });

        if (!paymentAdvice) return res.fail('Payment Advice not found', 404);

        res.success({ paymentAdvice }, 'Payment Advice retrieved successfully');
    } catch (error) {
        next(error);
    }
}

async function updatePaymentAdvice(req, res, next) {
    try {
        const { PaymentAdvice } = req.models;
        const { id } = req.params;
        const updateData = req.body || {};

        const paymentAdvice = await PaymentAdvice.findByPk(id);
        if (!paymentAdvice) return res.fail('Payment Advice not found', 404);

        // Prevent status change on non-draft advices (except for approval workflow)
        if (paymentAdvice.status !== 'draft' && updateData.status && updateData.status !== 'draft') {
            if (updateData.status !== 'approved' && updateData.status !== 'cancelled') {
                return res.fail('Can only approve or cancel non-draft payment advices', 400);
            }
        }

        // Track changes for audit log
        const changes = {};
        Object.keys(updateData).forEach(key => {
            if (paymentAdvice[key] !== updateData[key]) {
                changes[key] = { old: paymentAdvice[key], new: updateData[key] };
            }
        });

        // Handle status transitions
        if (updateData.status === 'approved') {
            updateData.approvedBy = (req.user && req.user.id) ? req.user.id : null;
            updateData.approvedAt = new Date();
        }

        if (updateData.status === 'sent') {
            updateData.sentAt = new Date();
        }

        if (updateData.status === 'acknowledged') {
            updateData.acknowledgedAt = new Date();
        }

        await paymentAdvice.update(updateData);

        // Add audit log
        await addAuditLog(req.models, {
            userId: (req.user && req.user.id) ? req.user.id : null,
            action: 'UPDATE',
            tableName: 'payment_advices',
            recordId: id,
            changes
        });

        res.success({ paymentAdvice }, 'Payment Advice updated successfully');
    } catch (error) {
        next(error);
    }
}

async function deletePaymentAdvice(req, res, next) {
    try {
        const { PaymentAdvice } = req.models;
        const { id } = req.params;

        const paymentAdvice = await PaymentAdvice.findByPk(id);
        if (!paymentAdvice) return res.fail('Payment Advice not found', 404);

        // Only allow deletion of draft advices
        if (paymentAdvice.status !== 'draft') {
            return res.fail('Can only delete draft payment advices', 400);
        }

        await paymentAdvice.destroy();

        // Add audit log
        await addAuditLog(req.models, {
            userId: (req.user && req.user.id) ? req.user.id : null,
            action: 'DELETE',
            tableName: 'payment_advices',
            recordId: id,
            changes: { deleted: true }
        });

        res.success({}, 'Payment Advice deleted successfully');
    } catch (error) {
        next(error);
    }
}

async function approvePaymentAdvice(req, res, next) {
    try {
        const { PaymentAdvice } = req.models;
        const { id } = req.params;

        const paymentAdvice = await PaymentAdvice.findByPk(id);
        if (!paymentAdvice) return res.fail('Payment Advice not found', 404);

        if (paymentAdvice.status !== 'draft') {
            return res.fail('Can only approve draft payment advices', 400);
        }

        await paymentAdvice.update({
            status: 'approved',
            approvedBy: (req.user && req.user.id) ? req.user.id : null,
            approvedAt: new Date()
        });

        // Add audit log
        await addAuditLog(req.models, {
            userId: (req.user && req.user.id) ? req.user.id : null,
            action: 'UPDATE',
            tableName: 'payment_advices',
            recordId: id,
            changes: { status: { old: 'draft', new: 'approved' } }
        });

        res.success({ paymentAdvice }, 'Payment Advice approved successfully');
    } catch (error) {
        next(error);
    }
}

async function sendPaymentAdvice(req, res, next) {
    try {
        const { PaymentAdvice } = req.models;
        const { id } = req.params;

        const paymentAdvice = await PaymentAdvice.findByPk(id);
        if (!paymentAdvice) return res.fail('Payment Advice not found', 404);

        if (paymentAdvice.status !== 'approved') {
            return res.fail('Can only send approved payment advices', 400);
        }

        await paymentAdvice.update({
            status: 'sent',
            sentAt: new Date()
        });

        // Add audit log
        await addAuditLog(req.models, {
            userId: (req.user && req.user.id) ? req.user.id : null,
            action: 'UPDATE',
            tableName: 'payment_advices',
            recordId: id,
            changes: { status: { old: 'approved', new: 'sent' } }
        });

        res.success({ paymentAdvice }, 'Payment Advice sent successfully');
    } catch (error) {
        next(error);
    }
}

async function acknowledgePaymentAdvice(req, res, next) {
    try {
        const { PaymentAdvice } = req.models;
        const { id } = req.params;

        const paymentAdvice = await PaymentAdvice.findByPk(id);
        if (!paymentAdvice) return res.fail('Payment Advice not found', 404);

        if (paymentAdvice.status !== 'sent') {
            return res.fail('Can only acknowledge sent payment advices', 400);
        }

        await paymentAdvice.update({
            status: 'acknowledged',
            acknowledgedAt: new Date()
        });

        // Add audit log
        await addAuditLog(req.models, {
            userId: (req.user && req.user.id) ? req.user.id : null,
            action: 'UPDATE',
            tableName: 'payment_advices',
            recordId: id,
            changes: { status: { old: 'sent', new: 'acknowledged' } }
        });

        res.success({ paymentAdvice }, 'Payment Advice acknowledged successfully');
    } catch (error) {
        next(error);
    }
}

async function getPaymentAdvicesByBatch(req, res, next) {
    try {
        const { PaymentAdvice, Provider } = req.models;
        const { paymentBatchId } = req.params;
        const { page = 1, limit = 10 } = req.query;

        const offset = (page - 1) * limit;

        const { count, rows } = await PaymentAdvice.findAndCountAll({
            where: { paymentBatchId },
            include: [
                {
                    model: Provider,
                    as: 'provider',
                    attributes: ['id', 'name', 'code']
                }
            ],
            offset,
            limit: parseInt(limit),
            order: [['createdAt', 'DESC']],
            distinct: true
        });

        res.success({
            paymentAdvices: rows,
            pagination: {
                total: count,
                page: parseInt(page),
                limit: parseInt(limit),
                pages: Math.ceil(count / limit)
            }
        }, 'Payment Advices for batch retrieved successfully');
    } catch (error) {
        next(error);
    }
}

module.exports = {
    createPaymentAdvice,
    listPaymentAdvices,
    getPaymentAdvice,
    updatePaymentAdvice,
    deletePaymentAdvice,
    approvePaymentAdvice,
    sendPaymentAdvice,
    acknowledgePaymentAdvice,
    getPaymentAdvicesByBatch
};
