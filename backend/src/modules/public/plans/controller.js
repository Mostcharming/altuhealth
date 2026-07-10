'use strict';

const { Op } = require('sequelize');

const COUNTRY_CURRENCY_MAP = {
    AE: 'AED',
    AU: 'AUD',
    BR: 'BRL',
    CA: 'CAD',
    CH: 'CHF',
    CN: 'CNY',
    DE: 'EUR',
    DK: 'DKK',
    ES: 'EUR',
    FR: 'EUR',
    GB: 'GBP',
    GH: 'GHS',
    HK: 'HKD',
    IE: 'EUR',
    IN: 'INR',
    JP: 'JPY',
    KE: 'KES',
    NG: 'NGN',
    NO: 'NOK',
    NZ: 'NZD',
    SE: 'SEK',
    SG: 'SGD',
    US: 'USD',
    ZA: 'ZAR'
};

function normalizeCurrency(value) {
    const code = String(value || '').trim().toUpperCase();
    return /^[A-Z]{3}$/.test(code) ? code : '';
}

function getCountryCode(req) {
    return String(
        req.get('cf-ipcountry')
        || req.get('x-vercel-ip-country')
        || req.get('x-country-code')
        || req.query.country
        || ''
    ).trim().toUpperCase();
}

function getDisplayCurrency(req) {
    const requestedCurrency = normalizeCurrency(req.query.currency);
    if (requestedCurrency) return requestedCurrency;

    const countryCode = getCountryCode(req);
    return COUNTRY_CURRENCY_MAP[countryCode] || 'NGN';
}

function serializeCurrencyRate(rate) {
    const plain = rate.toJSON();
    return {
        currencyCode: plain.currencyCode,
        currencyName: plain.currencyName,
        rateToNgn: Number(plain.rateToNgn),
        ngnToCurrencyRate: Number(plain.ngnToCurrencyRate)
    };
}

async function listPublicPlans(req, res, next) {
    try {
        const { Plan, CurrencyRate } = req.models;

        const [plans, rates] = await Promise.all([
            Plan.findAll({
                attributes: [
                    'id',
                    'name',
                    'code',
                    'description',
                    'annualPremiumPrice',
                    'currency',
                    'planCycle',
                    'allowDependentEnrolee',
                    'ageLimit',
                    'dependentAgeLimit',
                    'dependentAgeLimits',
                    'maxNumberOfDependents'
                ],
                where: {
                    isActive: true,
                    isApproved: true,
                    status: { [Op.in]: ['approved', 'active'] }
                },
                order: [['name', 'ASC']]
            }),
            CurrencyRate.findAll({
                attributes: [
                    'currencyCode',
                    'currencyName',
                    'rateToNgn',
                    'ngnToCurrencyRate'
                ],
                where: { isActive: true },
                order: [['currencyCode', 'ASC']]
            })
        ]);

        const currencyRates = rates.reduce((acc, rate) => {
            const serialized = serializeCurrencyRate(rate);
            acc[serialized.currencyCode] = serialized;
            return acc;
        }, {
            NGN: {
                currencyCode: 'NGN',
                currencyName: 'Nigerian Naira',
                rateToNgn: 1,
                ngnToCurrencyRate: 1
            }
        });

        return res.success({
            list: plans.map(plan => plan.toJSON()),
            displayCurrency: getDisplayCurrency(req),
            currencyRates
        }, 'Plans fetched');
    } catch (err) {
        return next(err);
    }
}

module.exports = {
    listPublicPlans
};
