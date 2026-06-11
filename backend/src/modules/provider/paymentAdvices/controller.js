'use strict';

const { Op } = require('sequelize');

function toPositiveInt(value, fallback = 1) {
    const parsed = Number.parseInt(value, 10);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function buildInclude(models) {
    const { Provider, PaymentBatch } = models;

    return [
        {
            model: Provider,
            as: 'provider',
            attributes: ['id', 'name', 'code', 'email', 'phoneNumber']
        },
        {
            model: PaymentBatch,
            as: 'paymentBatch',
            attributes: ['id', 'title', 'status', 'paymentDate', 'dueDate'],
            required: false
        }
    ];
}

async function listPaymentAdvices(req, res, next) {
    try {
        const { PaymentAdvice } = req.models;
        const providerId = req.user?.id;
        const {
            page = 1,
            limit = 10,
            q,
            sortBy = 'createdAt',
            sortOrder = 'DESC'
        } = req.query;

        if (!providerId) return res.fail('Provider ID is required', 400);

        const where = { providerId, status: 'sent' };
        if (q) {
            where[Op.or] = [
                { paymentAdviceNumber: { [Op.iLike]: `%${q}%` } },
                { description: { [Op.iLike]: `%${q}%` } },
                { notes: { [Op.iLike]: `%${q}%` } }
            ];
        }

        const safeLimit = Math.min(toPositiveInt(limit, 10), 100);
        const safePage = toPositiveInt(page, 1);
        const offset = (safePage - 1) * safeLimit;

        const { count, rows } = await PaymentAdvice.findAndCountAll({
            where,
            include: buildInclude(req.models),
            offset,
            limit: safeLimit,
            order: [[sortBy, String(sortOrder).toUpperCase() === 'ASC' ? 'ASC' : 'DESC']],
            distinct: true
        });

        return res.success({
            paymentAdvices: rows,
            pagination: {
                total: count,
                page: safePage,
                limit: safeLimit,
                pages: Math.ceil(count / safeLimit),
                hasNextPage: safePage * safeLimit < count,
                hasPreviousPage: safePage > 1
            }
        }, 'Provider payment advices retrieved successfully');
    } catch (error) {
        return next(error);
    }
}

async function getPaymentAdvice(req, res, next) {
    try {
        const { PaymentAdvice } = req.models;
        const providerId = req.user?.id;
        const { id } = req.params;

        if (!providerId) return res.fail('Provider ID is required', 400);

        const paymentAdvice = await PaymentAdvice.findOne({
            where: { id, providerId, status: 'paid' },
            include: buildInclude(req.models)
        });

        if (!paymentAdvice) return res.fail('Payment Advice not found', 404);

        return res.success({ paymentAdvice }, 'Payment Advice retrieved successfully');
    } catch (error) {
        return next(error);
    }
}

module.exports = {
    listPaymentAdvices,
    getPaymentAdvice
};
