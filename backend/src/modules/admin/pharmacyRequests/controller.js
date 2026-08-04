'use strict';

const crypto = require('crypto');
const { Op, fn, col } = require('sequelize');
const { addAdminNotification, addAuditLog } = require('../../../utils/addAdminNotification');

const MEMBER_ATTRIBUTES = ['id', 'firstName', 'lastName', 'policyNumber', 'email', 'phoneNumber'];
const ADMIN_ATTRIBUTES = ['id', 'firstName', 'lastName', 'email'];

function money(value) {
    return Math.round((Number(value) + Number.EPSILON) * 100) / 100;
}

function cleanText(value) {
    if (value === undefined || value === null) return null;
    const normalized = String(value).trim();
    return normalized || null;
}

function requestIncludes(models, includePayment = true) {
    const { Enrollee, RetailEnrollee, PharmacyRequestItem, PharmacyPayment, Admin } = models;
    const includes = [
        { model: Enrollee, as: 'enrollee', attributes: MEMBER_ATTRIBUTES, required: false },
        { model: RetailEnrollee, as: 'retailEnrollee', attributes: MEMBER_ATTRIBUTES, required: false },
        {
            model: PharmacyRequestItem,
            as: 'items',
            required: false,
            separate: true,
            order: [['createdAt', 'ASC']]
        },
        { model: Admin, as: 'creator', attributes: ADMIN_ATTRIBUTES, required: false },
        { model: Admin, as: 'reviewer', attributes: ADMIN_ATTRIBUTES, required: false }
    ];

    if (includePayment) {
        includes.push({
            model: PharmacyPayment,
            as: 'payment',
            required: false,
            include: [{ model: Admin, as: 'recordedByAdmin', attributes: ADMIN_ATTRIBUTES, required: false }]
        });
    }

    return includes;
}

function normalizeItems(items) {
    if (!Array.isArray(items) || items.length === 0) {
        throw Object.assign(new Error('At least one drug item is required'), { status: 400 });
    }

    return items.map((item, index) => {
        const drugName = cleanText(item && item.drugName);
        const quantity = Number(item && item.quantity);
        const unitPrice = money(item && item.unitPrice);

        if (!drugName) {
            throw Object.assign(new Error(`Drug name is required for item ${index + 1}`), { status: 400 });
        }
        if (!Number.isInteger(quantity) || quantity < 1) {
            throw Object.assign(new Error(`Quantity must be a whole number greater than 0 for item ${index + 1}`), { status: 400 });
        }
        if (!Number.isFinite(unitPrice) || unitPrice < 0) {
            throw Object.assign(new Error(`Unit price must be 0 or greater for item ${index + 1}`), { status: 400 });
        }

        return {
            drugName,
            quantity,
            unitPrice,
            lineTotal: money(quantity * unitPrice),
            notes: cleanText(item.notes)
        };
    });
}

function makeNumber(prefix, id) {
    return `${prefix}-${new Date().getFullYear()}-${id.replace(/-/g, '').slice(0, 8).toUpperCase()}`;
}

async function createPharmacyRequest(req, res, next) {
    try {
        const {
            PharmacyRequest,
            PharmacyRequestItem,
            Enrollee,
            RetailEnrollee
        } = req.models;
        const {
            memberType,
            enrolleeId,
            retailEnrolleeId,
            pharmacyName,
            pharmacyPhone,
            pharmacyAddress,
            purchaseDate,
            currency,
            receiptUrl,
            callReference,
            notes,
            items
        } = req.body || {};

        if (!['corporate', 'retail'].includes(memberType)) {
            return res.fail('`memberType` must be corporate or retail', 400);
        }
        if (!cleanText(pharmacyName)) return res.fail('`pharmacyName` is required', 400);
        const parsedPurchaseDate = purchaseDate ? new Date(`${purchaseDate}T00:00:00`) : null;
        if (!parsedPurchaseDate || Number.isNaN(parsedPurchaseDate.getTime())) {
            return res.fail('A valid `purchaseDate` is required', 400);
        }
        const endOfToday = new Date();
        endOfToday.setHours(23, 59, 59, 999);
        if (parsedPurchaseDate > endOfToday) return res.fail('`purchaseDate` cannot be in the future', 400);

        const normalizedCurrency = cleanText(currency) ? String(currency).trim().toUpperCase() : 'NGN';
        if (!/^[A-Z]{3}$/.test(normalizedCurrency)) return res.fail('`currency` must be a three-letter currency code', 400);

        const normalizedItems = normalizeItems(items);
        const amountClaimed = money(normalizedItems.reduce((sum, item) => sum + item.lineTotal, 0));
        if (amountClaimed <= 0) return res.fail('The total amount claimed must be greater than 0', 400);

        let member;
        if (memberType === 'corporate') {
            if (!enrolleeId) return res.fail('`enrolleeId` is required for a corporate enrollee', 400);
            member = await Enrollee.findOne({ where: { id: enrolleeId, isActive: true }, attributes: MEMBER_ATTRIBUTES });
        } else {
            if (!retailEnrolleeId) return res.fail('`retailEnrolleeId` is required for a retail enrollee', 400);
            member = await RetailEnrollee.findOne({ where: { id: retailEnrolleeId, isActive: true }, attributes: MEMBER_ATTRIBUTES });
        }
        if (!member) return res.fail('Enrollee not found', 404);

        const requestId = crypto.randomUUID();
        const requestNumber = makeNumber('PHR', requestId);
        const sequelize = PharmacyRequest.sequelize;
        let pharmacyRequest;

        await sequelize.transaction(async (transaction) => {
            pharmacyRequest = await PharmacyRequest.create({
                id: requestId,
                requestNumber,
                memberType,
                enrolleeId: memberType === 'corporate' ? enrolleeId : null,
                retailEnrolleeId: memberType === 'retail' ? retailEnrolleeId : null,
                pharmacyName: cleanText(pharmacyName),
                pharmacyPhone: cleanText(pharmacyPhone),
                pharmacyAddress: cleanText(pharmacyAddress),
                purchaseDate,
                amountClaimed,
                currency: normalizedCurrency,
                receiptUrl: cleanText(receiptUrl),
                callReference: cleanText(callReference),
                notes: cleanText(notes),
                status: 'pending',
                createdBy: req.user && req.user.id ? req.user.id : null
            }, { transaction });

            await PharmacyRequestItem.bulkCreate(
                normalizedItems.map((item) => ({ ...item, pharmacyRequestId: pharmacyRequest.id })),
                { transaction }
            );

            const memberName = `${member.firstName} ${member.lastName}`.trim();
            await addAdminNotification(req.models, {
                title: `Pharmacy request ${requestNumber} for ${memberName} needs review`,
                clickUrl: `/pharmacy-requests/${pharmacyRequest.id}`,
                transaction
            });
        });

        await addAuditLog(req.models, {
            action: 'pharmacyRequest.create',
            message: `Pharmacy reimbursement request ${requestNumber} logged`,
            userId: req.user && req.user.id ? req.user.id : null,
            userType: req.user && req.user.type ? req.user.type : 'Admin',
            meta: { pharmacyRequestId: pharmacyRequest.id, requestNumber, memberType, amountClaimed }
        });

        const created = await PharmacyRequest.findByPk(pharmacyRequest.id, {
            include: requestIncludes(req.models)
        });
        return res.success({ pharmacyRequest: created.toJSON() }, 'Pharmacy request logged and sent for approval', 201);
    } catch (err) {
        return next(err);
    }
}

async function listPharmacyRequests(req, res, next) {
    try {
        const { PharmacyRequest } = req.models;
        const { limit = 10, page = 1, q, status, memberType } = req.query;
        const limitNum = Math.min(Math.max(Number(limit) || 10, 1), 100);
        const pageNum = Math.max(Number(page) || 1, 1);
        const offset = (pageNum - 1) * limitNum;
        const where = {};

        if (status) where.status = status;
        if (memberType) where.memberType = memberType;
        if (cleanText(q)) {
            where[Op.or] = [
                { requestNumber: { [Op.iLike]: `%${String(q).trim()}%` } },
                { pharmacyName: { [Op.iLike]: `%${String(q).trim()}%` } },
                { callReference: { [Op.iLike]: `%${String(q).trim()}%` } },
                { '$enrollee.policy_number$': { [Op.iLike]: `%${String(q).trim()}%` } },
                { '$retailEnrollee.policy_number$': { [Op.iLike]: `%${String(q).trim()}%` } }
            ];
        }

        const { count, rows } = await PharmacyRequest.findAndCountAll({
            where,
            include: requestIncludes(req.models),
            order: [['createdAt', 'DESC']],
            limit: limitNum,
            offset,
            distinct: true,
            subQuery: false
        });

        const totalPages = Math.max(Math.ceil(count / limitNum), 1);
        return res.success({
            list: rows.map((item) => item.toJSON()),
            count,
            page: pageNum,
            limit: limitNum,
            totalPages,
            hasNextPage: pageNum < totalPages,
            hasPrevPage: pageNum > 1
        });
    } catch (err) {
        return next(err);
    }
}

async function getPharmacyRequest(req, res, next) {
    try {
        const { PharmacyRequest } = req.models;
        const pharmacyRequest = await PharmacyRequest.findByPk(req.params.id, {
            include: requestIncludes(req.models)
        });
        if (!pharmacyRequest) return res.fail('Pharmacy request not found', 404);
        return res.success({ pharmacyRequest: pharmacyRequest.toJSON() });
    } catch (err) {
        return next(err);
    }
}

async function approvePharmacyRequest(req, res, next) {
    try {
        const { PharmacyRequest } = req.models;
        const approvedAmount = money(req.body && req.body.approvedAmount);
        if (!Number.isFinite(approvedAmount) || approvedAmount <= 0) {
            return res.fail('`approvedAmount` must be greater than 0', 400);
        }

        const sequelize = PharmacyRequest.sequelize;
        let pharmacyRequest;
        await sequelize.transaction(async (transaction) => {
            pharmacyRequest = await PharmacyRequest.findByPk(req.params.id, {
                transaction,
                lock: transaction.LOCK.UPDATE
            });
            if (!pharmacyRequest) throw Object.assign(new Error('Pharmacy request not found'), { status: 404 });
            if (pharmacyRequest.status !== 'pending') {
                throw Object.assign(new Error('Only pending pharmacy requests can be approved'), { status: 400 });
            }
            if (approvedAmount > money(pharmacyRequest.amountClaimed)) {
                throw Object.assign(new Error('Approved amount cannot exceed the amount claimed'), { status: 400 });
            }

            await pharmacyRequest.update({
                status: 'approved',
                approvedAmount,
                reviewNotes: cleanText(req.body && req.body.reviewNotes),
                rejectionReason: null,
                reviewedBy: req.user && req.user.id ? req.user.id : null,
                reviewedAt: new Date()
            }, { transaction });
        });

        await addAuditLog(req.models, {
            action: 'pharmacyRequest.approve',
            message: `Pharmacy reimbursement request ${pharmacyRequest.requestNumber} approved`,
            userId: req.user && req.user.id ? req.user.id : null,
            userType: req.user && req.user.type ? req.user.type : 'Admin',
            meta: { pharmacyRequestId: pharmacyRequest.id, approvedAmount }
        });

        return res.success({ pharmacyRequest }, 'Pharmacy request approved');
    } catch (err) {
        return next(err);
    }
}

async function rejectPharmacyRequest(req, res, next) {
    try {
        const { PharmacyRequest } = req.models;
        const rejectionReason = cleanText(req.body && req.body.rejectionReason);
        if (!rejectionReason) return res.fail('`rejectionReason` is required', 400);

        const sequelize = PharmacyRequest.sequelize;
        let pharmacyRequest;
        await sequelize.transaction(async (transaction) => {
            pharmacyRequest = await PharmacyRequest.findByPk(req.params.id, {
                transaction,
                lock: transaction.LOCK.UPDATE
            });
            if (!pharmacyRequest) throw Object.assign(new Error('Pharmacy request not found'), { status: 404 });
            if (pharmacyRequest.status !== 'pending') {
                throw Object.assign(new Error('Only pending pharmacy requests can be rejected'), { status: 400 });
            }

            await pharmacyRequest.update({
                status: 'rejected',
                approvedAmount: null,
                rejectionReason,
                reviewNotes: cleanText(req.body && req.body.reviewNotes),
                reviewedBy: req.user && req.user.id ? req.user.id : null,
                reviewedAt: new Date()
            }, { transaction });
        });

        await addAuditLog(req.models, {
            action: 'pharmacyRequest.reject',
            message: `Pharmacy reimbursement request ${pharmacyRequest.requestNumber} rejected`,
            userId: req.user && req.user.id ? req.user.id : null,
            userType: req.user && req.user.type ? req.user.type : 'Admin',
            meta: { pharmacyRequestId: pharmacyRequest.id, rejectionReason }
        });

        return res.success({ pharmacyRequest }, 'Pharmacy request rejected');
    } catch (err) {
        return next(err);
    }
}

async function recordPharmacyPayment(req, res, next) {
    try {
        const { PharmacyRequest, PharmacyPayment } = req.models;
        const {
            amount,
            paymentDate,
            paymentMethod,
            transactionReference,
            beneficiaryName,
            bankName,
            accountName,
            accountNumber,
            proofUrl,
            notes
        } = req.body || {};
        const paymentAmount = money(amount);
        const validMethods = ['bank_transfer', 'cash', 'cheque', 'mobile_money', 'wallet', 'other'];

        if (!Number.isFinite(paymentAmount) || paymentAmount <= 0) return res.fail('`amount` must be greater than 0', 400);
        if (!validMethods.includes(paymentMethod)) return res.fail('A valid `paymentMethod` is required', 400);
        if (!cleanText(beneficiaryName)) return res.fail('`beneficiaryName` is required', 400);
        if (paymentMethod === 'bank_transfer' && (!cleanText(bankName) || !cleanText(accountName) || !cleanText(accountNumber))) {
            return res.fail('Bank name, account name, and account number are required for a bank transfer', 400);
        }

        const paymentId = crypto.randomUUID();
        const paymentNumber = makeNumber('PHP', paymentId);
        const sequelize = PharmacyRequest.sequelize;
        let payment;
        let pharmacyRequest;

        await sequelize.transaction(async (transaction) => {
            pharmacyRequest = await PharmacyRequest.findByPk(req.params.id, {
                transaction,
                lock: transaction.LOCK.UPDATE
            });
            if (!pharmacyRequest) throw Object.assign(new Error('Pharmacy request not found'), { status: 404 });
            if (pharmacyRequest.status !== 'approved') {
                throw Object.assign(new Error('Only approved pharmacy requests can be paid'), { status: 400 });
            }
            if (paymentAmount !== money(pharmacyRequest.approvedAmount)) {
                throw Object.assign(new Error('Payment amount must equal the approved amount'), { status: 400 });
            }

            const existingPayment = await PharmacyPayment.findOne({
                where: { pharmacyRequestId: pharmacyRequest.id },
                transaction,
                lock: transaction.LOCK.UPDATE
            });
            if (existingPayment) throw Object.assign(new Error('Payment has already been recorded for this request'), { status: 409 });

            payment = await PharmacyPayment.create({
                id: paymentId,
                pharmacyRequestId: pharmacyRequest.id,
                paymentNumber,
                amount: paymentAmount,
                currency: pharmacyRequest.currency,
                paymentDate: paymentDate || new Date(),
                paymentMethod,
                transactionReference: cleanText(transactionReference),
                beneficiaryName: cleanText(beneficiaryName),
                bankName: cleanText(bankName),
                accountName: cleanText(accountName),
                accountNumber: cleanText(accountNumber),
                proofUrl: cleanText(proofUrl),
                notes: cleanText(notes),
                recordedBy: req.user && req.user.id ? req.user.id : null
            }, { transaction });

            await pharmacyRequest.update({ status: 'paid', paidAt: new Date() }, { transaction });
        });

        await addAuditLog(req.models, {
            action: 'pharmacyPayment.create',
            message: `Payment ${paymentNumber} recorded for ${pharmacyRequest.requestNumber}`,
            userId: req.user && req.user.id ? req.user.id : null,
            userType: req.user && req.user.type ? req.user.type : 'Admin',
            meta: { pharmacyRequestId: pharmacyRequest.id, pharmacyPaymentId: payment.id, amount: paymentAmount }
        });

        return res.success({ payment, pharmacyRequest }, 'Pharmacy reimbursement payment recorded', 201);
    } catch (err) {
        return next(err);
    }
}

async function listPharmacyPayments(req, res, next) {
    try {
        const { PharmacyPayment, PharmacyRequest, Enrollee, RetailEnrollee, Admin } = req.models;
        const { limit = 10, page = 1, q, paymentMethod } = req.query;
        const limitNum = Math.min(Math.max(Number(limit) || 10, 1), 100);
        const pageNum = Math.max(Number(page) || 1, 1);
        const offset = (pageNum - 1) * limitNum;
        const where = {};

        if (paymentMethod) where.paymentMethod = paymentMethod;
        if (cleanText(q)) {
            where[Op.or] = [
                { paymentNumber: { [Op.iLike]: `%${String(q).trim()}%` } },
                { transactionReference: { [Op.iLike]: `%${String(q).trim()}%` } },
                { beneficiaryName: { [Op.iLike]: `%${String(q).trim()}%` } }
            ];
        }

        const { count, rows } = await PharmacyPayment.findAndCountAll({
            where,
            include: [
                {
                    model: PharmacyRequest,
                    as: 'request',
                    required: true,
                    include: [
                        { model: Enrollee, as: 'enrollee', attributes: MEMBER_ATTRIBUTES, required: false },
                        { model: RetailEnrollee, as: 'retailEnrollee', attributes: MEMBER_ATTRIBUTES, required: false }
                    ]
                },
                { model: Admin, as: 'recordedByAdmin', attributes: ADMIN_ATTRIBUTES, required: false }
            ],
            order: [['paymentDate', 'DESC']],
            limit: limitNum,
            offset,
            distinct: true
        });

        const totalPages = Math.max(Math.ceil(count / limitNum), 1);
        return res.success({
            list: rows.map((item) => item.toJSON()),
            count,
            page: pageNum,
            limit: limitNum,
            totalPages,
            hasNextPage: pageNum < totalPages,
            hasPrevPage: pageNum > 1
        });
    } catch (err) {
        return next(err);
    }
}

async function getPharmacySummary(req, res, next) {
    try {
        const { PharmacyRequest, PharmacyPayment } = req.models;
        const [grouped, totalClaimed, totalApproved, totalPaid] = await Promise.all([
            PharmacyRequest.findAll({
                attributes: ['status', [fn('COUNT', col('id')), 'count']],
                group: ['status'],
                raw: true
            }),
            PharmacyRequest.sum('amountClaimed'),
            PharmacyRequest.sum('approvedAmount', { where: { status: { [Op.in]: ['approved', 'paid'] } } }),
            PharmacyPayment.sum('amount')
        ]);
        const counts = { pending: 0, approved: 0, rejected: 0, paid: 0 };
        grouped.forEach((row) => {
            if (Object.prototype.hasOwnProperty.call(counts, row.status)) counts[row.status] = Number(row.count);
        });

        return res.success({
            counts,
            totalRequests: Object.values(counts).reduce((sum, value) => sum + value, 0),
            totalClaimed: money(totalClaimed || 0),
            totalApproved: money(totalApproved || 0),
            totalPaid: money(totalPaid || 0)
        });
    } catch (err) {
        return next(err);
    }
}

module.exports = {
    createPharmacyRequest,
    listPharmacyRequests,
    getPharmacyRequest,
    approvePharmacyRequest,
    rejectPharmacyRequest,
    recordPharmacyPayment,
    listPharmacyPayments,
    getPharmacySummary
};
