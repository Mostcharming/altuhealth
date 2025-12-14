'use strict';

const { Op } = require('sequelize');
const { addAuditLog } = require('../../../utils/addAdminNotification');

async function createPayment(req, res, next) {
    try {
        const { Payment, Invoice } = req.models;
        const {
            invoiceId,
            paymentAmount,
            paymentDate,
            paymentMethod,
            currency,
            transactionReference,
            bankName,
            accountName,
            chequeNumber,
            chequeDate,
            paymentGatewayProvider,
            paymentGatewayTransactionId,
            description,
            receiptUrl,
            verificationStatus
        } = req.body || {};

        if (!invoiceId) return res.fail('`invoiceId` is required', 400);
        if (!paymentAmount || parseFloat(paymentAmount) <= 0) return res.fail('`paymentAmount` must be greater than 0', 400);
        if (!paymentMethod) return res.fail('`paymentMethod` is required', 400);

        // Verify invoice exists
        const invoice = await Invoice.findByPk(invoiceId);
        if (!invoice) return res.fail('Invoice not found', 404);

        // Generate payment number
        const paymentCount = await Payment.count();
        const paymentNumber = `PAY-${new Date().getFullYear()}-${String(paymentCount + 1).padStart(6, '0')}`;

        // Create payment
        const payment = await Payment.create({
            invoiceId,
            paymentNumber,
            paymentAmount: parseFloat(paymentAmount),
            paymentDate: paymentDate || new Date(),
            paymentMethod,
            currency: currency || 'NGN',
            transactionReference: transactionReference || null,
            bankName: bankName || null,
            accountName: accountName || null,
            chequeNumber: chequeNumber || null,
            chequeDate: chequeDate || null,
            paymentGatewayProvider: paymentGatewayProvider || null,
            paymentGatewayTransactionId: paymentGatewayTransactionId || null,
            description: description || null,
            receiptUrl: receiptUrl || null,
            status: 'completed',
            processedBy: (req.user && req.user.id) ? req.user.id : null,
            processedByType: (req.user && req.user.type) ? req.user.type : 'System',
            verificationStatus: verificationStatus || 'unverified'
        });

        // Update invoice payment status
        const newPaidAmount = parseFloat(invoice.paidAmount || 0) + parseFloat(paymentAmount);
        const newBalanceAmount = parseFloat(invoice.totalAmount) - newPaidAmount;

        let newPaymentStatus = 'unpaid';
        let newInvoiceStatus = invoice.status;

        if (newPaidAmount >= parseFloat(invoice.totalAmount)) {
            newPaymentStatus = 'paid';
            if (newInvoiceStatus !== 'cancelled') {
                newInvoiceStatus = 'paid';
            }
        } else if (newPaidAmount > 0) {
            newPaymentStatus = 'partially_paid';
            if (newInvoiceStatus !== 'cancelled' && newInvoiceStatus !== 'overdue') {
                newInvoiceStatus = 'partially_paid';
            }
        }

        await invoice.update({
            paidAmount: newPaidAmount,
            balanceAmount: Math.max(0, newBalanceAmount),
            paymentStatus: newPaymentStatus,
            status: newInvoiceStatus
        });

        await addAuditLog(req.models, {
            action: 'payment.create',
            message: `Payment recorded for invoice`,
            userId: (req.user && req.user.id) ? req.user.id : null,
            userType: (req.user && req.user.type) ? req.user.type : null,
            meta: { paymentId: payment.id, invoiceId, amount: paymentAmount }
        });

        return res.success({
            payment: payment.toJSON(),
            invoice: invoice.toJSON()
        }, 'Payment recorded', 201);
    } catch (err) {
        return next(err);
    }
}

async function updatePayment(req, res, next) {
    try {
        const { Payment, Invoice } = req.models;
        const { id } = req.params;
        const {
            transactionReference,
            bankName,
            accountName,
            chequeNumber,
            chequeDate,
            paymentGatewayProvider,
            paymentGatewayTransactionId,
            description,
            receiptUrl,
            status,
            notes
        } = req.body || {};

        const payment = await Payment.findByPk(id);
        if (!payment) return res.fail('Payment not found', 404);

        const updates = {};
        if (transactionReference !== undefined) updates.transactionReference = transactionReference;
        if (bankName !== undefined) updates.bankName = bankName;
        if (accountName !== undefined) updates.accountName = accountName;
        if (chequeNumber !== undefined) updates.chequeNumber = chequeNumber;
        if (chequeDate !== undefined) updates.chequeDate = chequeDate;
        if (paymentGatewayProvider !== undefined) updates.paymentGatewayProvider = paymentGatewayProvider;
        if (paymentGatewayTransactionId !== undefined) updates.paymentGatewayTransactionId = paymentGatewayTransactionId;
        if (description !== undefined) updates.description = description;
        if (receiptUrl !== undefined) updates.receiptUrl = receiptUrl;
        if (status !== undefined) updates.status = status;
        if (notes !== undefined) updates.notes = notes;

        await payment.update(updates);

        await addAuditLog(req.models, {
            action: 'payment.update',
            message: `Payment updated`,
            userId: (req.user && req.user.id) ? req.user.id : null,
            userType: (req.user && req.user.type) ? req.user.type : null,
            meta: { paymentId: payment.id }
        });

        return res.success({ payment }, 'Payment updated');
    } catch (err) {
        return next(err);
    }
}

async function deletePayment(req, res, next) {
    try {
        const { Payment, Invoice } = req.models;
        const { id } = req.params;

        const payment = await Payment.findByPk(id);
        if (!payment) return res.fail('Payment not found', 404);

        const invoice = await Invoice.findByPk(payment.invoiceId);

        // Recalculate invoice totals
        if (invoice) {
            const newPaidAmount = Math.max(0, parseFloat(invoice.paidAmount) - parseFloat(payment.paymentAmount));
            const newBalanceAmount = parseFloat(invoice.totalAmount) - newPaidAmount;

            let newPaymentStatus = 'unpaid';
            let newInvoiceStatus = invoice.status;

            if (newPaidAmount >= parseFloat(invoice.totalAmount)) {
                newPaymentStatus = 'paid';
            } else if (newPaidAmount > 0) {
                newPaymentStatus = 'partially_paid';
            }

            // Reset invoice status if needed
            if (invoice.status === 'paid' && newPaymentStatus !== 'paid') {
                newInvoiceStatus = newPaymentStatus === 'partially_paid' ? 'partially_paid' : 'issued';
            }

            await invoice.update({
                paidAmount: newPaidAmount,
                balanceAmount: newBalanceAmount,
                paymentStatus: newPaymentStatus,
                status: newInvoiceStatus
            });
        }

        await payment.destroy();

        await addAuditLog(req.models, {
            action: 'payment.delete',
            message: `Payment deleted`,
            userId: (req.user && req.user.id) ? req.user.id : null,
            userType: (req.user && req.user.type) ? req.user.type : null,
            meta: { paymentId: id }
        });

        return res.success(null, 'Payment deleted');
    } catch (err) {
        return next(err);
    }
}

async function listPayments(req, res, next) {
    try {
        const { Payment, Invoice, Provider, Admin } = req.models;
        const { limit = 10, page = 1, q, invoiceId, paymentMethod, status, verificationStatus } = req.query;

        const isAll = String(limit).toLowerCase() === 'all';
        const limitNum = isAll ? 0 : Number(limit);
        const pageNum = isAll ? 1 : (Number(page) || 1);
        const offset = isAll ? 0 : (pageNum - 1) * limitNum;

        const where = {};

        if (invoiceId) {
            where.invoiceId = invoiceId;
        }

        if (paymentMethod) {
            where.paymentMethod = paymentMethod;
        }

        if (status) {
            where.status = status;
        }

        if (verificationStatus) {
            where.verificationStatus = verificationStatus;
        }

        if (q) {
            where[Op.or] = [
                { paymentNumber: { [Op.iLike || Op.like]: `%${q}%` } },
                { transactionReference: { [Op.iLike || Op.like]: `%${q}%` } },
                { bankName: { [Op.iLike || Op.like]: `%${q}%` } },
                { accountName: { [Op.iLike || Op.like]: `%${q}%` } },
                { chequeNumber: { [Op.iLike || Op.like]: `%${q}%` } }
            ];
        }

        const total = await Payment.count({ where });

        const findOptions = {
            where,
            order: [['paymentDate', 'DESC']],
            include: [
                {
                    model: Invoice,
                    attributes: ['id', 'invoiceNumber', 'customerName', 'totalAmount', 'status', 'paymentStatus'],
                    required: false,
                    include: [
                        {
                            model: Provider,
                            attributes: ['id', 'name', 'code'],
                            required: false
                        }
                    ]
                },
                {
                    model: Admin,
                    attributes: ['id', 'firstName', 'lastName', 'email'],
                    as: 'processedByAdmin',
                    required: false
                },
                {
                    model: Admin,
                    attributes: ['id', 'firstName', 'lastName', 'email'],
                    as: 'verifiedByAdmin',
                    required: false
                }
            ]
        };

        if (!isAll) {
            findOptions.limit = limitNum;
            findOptions.offset = Number(offset);
        }

        const payments = await Payment.findAll(findOptions);
        const data = payments.map(pmt => pmt.toJSON());

        const hasPrevPage = !isAll && pageNum > 1;
        const hasNextPage = !isAll && (offset + payments.length < total);
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

async function getPayment(req, res, next) {
    try {
        const { Payment, Invoice, Provider, Admin } = req.models;
        const { id } = req.params;

        const payment = await Payment.findByPk(id, {
            include: [
                {
                    model: Invoice,
                    attributes: ['id', 'invoiceNumber', 'customerName', 'providerId', 'enrolleeId', 'retailEnrolleeId', 'totalAmount', 'paidAmount', 'balanceAmount', 'status', 'paymentStatus'],
                    required: false,
                    include: [
                        {
                            model: Provider,
                            attributes: ['id', 'name', 'code', 'email', 'phoneNumber'],
                            required: false
                        }
                    ]
                },
                {
                    model: Admin,
                    attributes: ['id', 'firstName', 'lastName', 'email'],
                    as: 'processedByAdmin',
                    required: false
                },
                {
                    model: Admin,
                    attributes: ['id', 'firstName', 'lastName', 'email'],
                    as: 'verifiedByAdmin',
                    required: false
                }
            ]
        });

        if (!payment) return res.fail('Payment not found', 404);

        return res.success(payment.toJSON());
    } catch (err) {
        return next(err);
    }
}

async function verifyPayment(req, res, next) {
    try {
        const { Payment } = req.models;
        const { id } = req.params;

        const payment = await Payment.findByPk(id);
        if (!payment) return res.fail('Payment not found', 404);

        await payment.update({
            verificationStatus: 'verified',
            verifiedAt: new Date(),
            verifiedBy: (req.user && req.user.id) ? req.user.id : null
        });

        await addAuditLog(req.models, {
            action: 'payment.verify',
            message: `Payment verified`,
            userId: (req.user && req.user.id) ? req.user.id : null,
            userType: (req.user && req.user.type) ? req.user.type : null,
            meta: { paymentId: payment.id }
        });

        return res.success({ payment }, 'Payment verified');
    } catch (err) {
        return next(err);
    }
}

async function refundPayment(req, res, next) {
    try {
        const { Payment, Invoice } = req.models;
        const { id } = req.params;
        const { refundAmount, refundReason } = req.body || {};

        if (!refundAmount || parseFloat(refundAmount) <= 0) return res.fail('`refundAmount` must be greater than 0', 400);

        const payment = await Payment.findByPk(id);
        if (!payment) return res.fail('Payment not found', 404);

        if (parseFloat(refundAmount) > parseFloat(payment.paymentAmount)) {
            return res.fail('Refund amount cannot exceed payment amount', 400);
        }

        const invoice = await Invoice.findByPk(payment.invoiceId);

        // Update payment
        const newRefundAmount = parseFloat(payment.refundAmount || 0) + parseFloat(refundAmount);
        await payment.update({
            status: newRefundAmount >= parseFloat(payment.paymentAmount) ? 'refunded' : 'completed',
            refundAmount: newRefundAmount,
            refundDate: new Date(),
            refundReason: refundReason || null
        });

        // Update invoice if necessary
        if (invoice) {
            const newPaidAmount = parseFloat(invoice.paidAmount) - parseFloat(refundAmount);
            const newBalanceAmount = parseFloat(invoice.totalAmount) - newPaidAmount;

            let newPaymentStatus = 'unpaid';
            let newInvoiceStatus = invoice.status;

            if (newPaidAmount >= parseFloat(invoice.totalAmount)) {
                newPaymentStatus = 'paid';
            } else if (newPaidAmount > 0) {
                newPaymentStatus = 'partially_paid';
            }

            if (invoice.status === 'paid' && newPaymentStatus !== 'paid') {
                newInvoiceStatus = newPaymentStatus === 'partially_paid' ? 'partially_paid' : 'issued';
            }

            await invoice.update({
                paidAmount: Math.max(0, newPaidAmount),
                balanceAmount: newBalanceAmount,
                paymentStatus: newPaymentStatus,
                status: newInvoiceStatus
            });
        }

        await addAuditLog(req.models, {
            action: 'payment.refund',
            message: `Payment refunded`,
            userId: (req.user && req.user.id) ? req.user.id : null,
            userType: (req.user && req.user.type) ? req.user.type : null,
            meta: { paymentId: payment.id, refundAmount }
        });

        return res.success({ payment }, 'Payment refunded');
    } catch (err) {
        return next(err);
    }
}

module.exports = {
    createPayment,
    updatePayment,
    deletePayment,
    listPayments,
    getPayment,
    verifyPayment,
    refundPayment
};
