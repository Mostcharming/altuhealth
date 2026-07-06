'use strict';

const axios = require('axios');
const { Op } = require('sequelize');

const EXCHANGE_RATE_URL = 'https://open.er-api.com/v6/latest/NGN';
const EXCHANGE_RATE_SOURCE = 'open.er-api.com';

const normalizeCode = (code) => String(code || '').trim().toUpperCase();

const parsePositiveNumber = (value, field) => {
    const numeric = Number(value);
    if (!Number.isFinite(numeric) || numeric <= 0) {
        const error = new Error(`\`${field}\` must be a positive number`);
        error.statusCode = 400;
        throw error;
    }
    return numeric;
};

const serializeRate = (rate) => {
    const plain = typeof rate.toJSON === 'function' ? rate.toJSON() : rate;
    return {
        ...plain,
        rateToNgn: Number(plain.rateToNgn),
        ngnToCurrencyRate: Number(plain.ngnToCurrencyRate)
    };
};

async function listCurrencyRates(req, res, next) {
    try {
        const { CurrencyRate } = req.models;
        const { q, page = 1, limit = 20, isActive } = req.query || {};
        const pageNum = Math.max(Number(page) || 1, 1);
        const limitNum = limit === 'all' ? null : Math.min(Math.max(Number(limit) || 20, 1), 200);
        const where = {};

        if (q) {
            where[Op.or] = [
                { currencyCode: { [Op.iLike]: `%${q}%` } },
                { currencyName: { [Op.iLike]: `%${q}%` } }
            ];
        }

        if (isActive !== undefined && isActive !== '') {
            where.isActive = String(isActive) === 'true';
        }

        const result = await CurrencyRate.findAndCountAll({
            where,
            order: [['currencyCode', 'ASC']],
            ...(limitNum ? { limit: limitNum, offset: (pageNum - 1) * limitNum } : {})
        });

        const totalPages = limitNum ? Math.ceil(result.count / limitNum) || 1 : 1;

        return res.success({
            list: result.rows.map(serializeRate),
            count: result.count,
            page: pageNum,
            limit: limitNum || 'all',
            totalPages,
            hasNextPage: limitNum ? pageNum < totalPages : false,
            hasPreviousPage: limitNum ? pageNum > 1 : false
        }, 'Currency rates fetched successfully');
    } catch (err) {
        next(err);
    }
}

async function getCurrencyRate(req, res, next) {
    try {
        const { CurrencyRate } = req.models;
        const rate = await CurrencyRate.findByPk(req.params.id);
        if (!rate) return res.fail('Currency rate not found', 404);
        return res.success(serializeRate(rate), 'Currency rate fetched successfully');
    } catch (err) {
        next(err);
    }
}

async function createCurrencyRate(req, res, next) {
    try {
        const { CurrencyRate } = req.models;
        const code = normalizeCode(req.body.currencyCode);
        const rateToNgn = parsePositiveNumber(req.body.rateToNgn, 'rateToNgn');
        if (!code || code.length !== 3) return res.fail('`currencyCode` must be a 3-letter code', 400);

        const existing = await CurrencyRate.findOne({ where: { currencyCode: code } });
        if (existing) return res.fail('Currency rate already exists. Edit the existing rate instead.', 400);

        const created = await CurrencyRate.create({
            currencyCode: code,
            currencyName: req.body.currencyName || code,
            rateToNgn,
            ngnToCurrencyRate: 1 / rateToNgn,
            source: req.body.source || 'manual',
            notes: req.body.notes || null,
            isActive: req.body.isActive !== undefined ? Boolean(req.body.isActive) : true
        });

        return res.success(serializeRate(created), 'Currency rate created successfully', 201);
    } catch (err) {
        next(err);
    }
}

async function updateCurrencyRate(req, res, next) {
    try {
        const { CurrencyRate } = req.models;
        const rate = await CurrencyRate.findByPk(req.params.id);
        if (!rate) return res.fail('Currency rate not found', 404);

        const updates = {};
        if (req.body.currencyCode !== undefined) {
            const code = normalizeCode(req.body.currencyCode);
            if (!code || code.length !== 3) return res.fail('`currencyCode` must be a 3-letter code', 400);
            updates.currencyCode = code;
        }
        if (req.body.currencyName !== undefined) updates.currencyName = req.body.currencyName || updates.currencyCode || rate.currencyCode;
        if (req.body.rateToNgn !== undefined) {
            const rateToNgn = parsePositiveNumber(req.body.rateToNgn, 'rateToNgn');
            updates.rateToNgn = rateToNgn;
            updates.ngnToCurrencyRate = 1 / rateToNgn;
            updates.source = req.body.source || 'manual';
            updates.lastFetchedAt = null;
            updates.sourcePayload = null;
        }
        if (req.body.source !== undefined) updates.source = req.body.source || 'manual';
        if (req.body.notes !== undefined) updates.notes = req.body.notes || null;
        if (req.body.isActive !== undefined) updates.isActive = Boolean(req.body.isActive);

        await rate.update(updates);
        return res.success(serializeRate(rate), 'Currency rate updated successfully');
    } catch (err) {
        next(err);
    }
}

async function deleteCurrencyRate(req, res, next) {
    try {
        const { CurrencyRate } = req.models;
        const rate = await CurrencyRate.findByPk(req.params.id);
        if (!rate) return res.fail('Currency rate not found', 404);
        await rate.destroy();
        return res.success(null, 'Currency rate deleted successfully');
    } catch (err) {
        next(err);
    }
}

async function fetchLatestRates(req, res, next) {
    try {
        const { CurrencyRate } = req.models;
        const response = await axios.get(EXCHANGE_RATE_URL, { timeout: 15000 });
        const payload = response.data || {};
        if (payload.result && payload.result !== 'success') {
            return res.fail(payload['error-type'] || 'Unable to fetch exchange rates', 502);
        }

        const rates = payload.rates || {};
        const fetchedAt = payload.time_last_update_unix
            ? new Date(payload.time_last_update_unix * 1000)
            : new Date();
        const codes = Object.keys(rates).filter((code) => Number(rates[code]) > 0);
        let upserted = 0;

        for (const code of codes) {
            const currencyCode = normalizeCode(code);
            const ngnToCurrencyRate = Number(rates[code]);
            const rateToNgn = currencyCode === 'NGN' ? 1 : 1 / ngnToCurrencyRate;
            const [row, created] = await CurrencyRate.findOrCreate({
                where: { currencyCode },
                defaults: {
                    currencyCode,
                    currencyName: currencyCode,
                    rateToNgn,
                    ngnToCurrencyRate,
                    source: EXCHANGE_RATE_SOURCE,
                    sourcePayload: {
                        baseCode: payload.base_code || 'NGN',
                        timeLastUpdateUtc: payload.time_last_update_utc,
                        timeNextUpdateUtc: payload.time_next_update_utc
                    },
                    lastFetchedAt: fetchedAt,
                    isActive: true
                }
            });

            if (!created) {
                await row.update({
                    rateToNgn,
                    ngnToCurrencyRate,
                    source: EXCHANGE_RATE_SOURCE,
                    sourcePayload: {
                        baseCode: payload.base_code || 'NGN',
                        timeLastUpdateUtc: payload.time_last_update_utc,
                        timeNextUpdateUtc: payload.time_next_update_utc
                    },
                    lastFetchedAt: fetchedAt
                });
            }

            upserted += 1;
        }

        return res.success({
            source: EXCHANGE_RATE_SOURCE,
            attributionRequired: true,
            baseCode: payload.base_code || 'NGN',
            fetchedAt,
            count: upserted
        }, 'Currency rates fetched and saved successfully');
    } catch (err) {
        next(err);
    }
}

module.exports = {
    listCurrencyRates,
    getCurrencyRate,
    createCurrencyRate,
    updateCurrencyRate,
    deleteCurrencyRate,
    fetchLatestRates
};
