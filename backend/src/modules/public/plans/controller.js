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

async function getPublicPlanBenefits(req, res, next) {
    try {
        const {
            Plan,
            PlanBenefitCategory,
            PlanBenefit,
            BenefitCategory,
            Benefit
        } = req.models;
        const { id } = req.params;

        const plan = await Plan.findOne({
            attributes: ['id', 'name', 'code', 'description'],
            where: {
                id,
                isActive: true,
                isApproved: true,
                status: { [Op.in]: ['approved', 'active'] }
            }
        });

        if (!plan) return res.fail('Plan not found', 404);

        const [categoryLinks, benefitLinks] = await Promise.all([
            PlanBenefitCategory.findAll({
                attributes: ['benefitCategoryId'],
                where: { planId: id }
            }),
            PlanBenefit.findAll({
                attributes: ['benefitId'],
                where: { planId: id }
            })
        ]);

        const benefitIds = [...new Set(
            benefitLinks.map(link => String(link.benefitId)).filter(Boolean)
        )];
        const benefits = benefitIds.length > 0
            ? await Benefit.findAll({
                attributes: [
                    'id',
                    'name',
                    'description',
                    'isCovered',
                    'coverageType',
                    'coverageValue',
                    'benefitCategoryId'
                ],
                where: { id: { [Op.in]: benefitIds } },
                order: [['name', 'ASC']]
            })
            : [];

        const categoryIds = [...new Set([
            ...categoryLinks.map(link => String(link.benefitCategoryId)),
            ...benefits.map(benefit => String(benefit.benefitCategoryId))
        ].filter(Boolean))];
        const categories = categoryIds.length > 0
            ? await BenefitCategory.findAll({
                attributes: ['id', 'name'],
                where: { id: { [Op.in]: categoryIds } },
                order: [['name', 'ASC']]
            })
            : [];

        const benefitsByCategory = benefits.reduce((acc, benefit) => {
            const categoryId = String(benefit.benefitCategoryId);
            acc[categoryId] = acc[categoryId] || [];
            acc[categoryId].push(benefit.toJSON());
            return acc;
        }, {});

        const serializedCategories = categories.map(category => {
            const data = category.toJSON();
            const categoryBenefits = benefitsByCategory[String(data.id)] || [];
            return {
                id: data.id,
                name: data.name,
                benefitCount: categoryBenefits.length,
                benefits: categoryBenefits
            };
        });
        const coveredBenefitCount = benefits.filter(benefit => benefit.isCovered).length;

        return res.success({
            plan: plan.toJSON(),
            summary: {
                categoryCount: serializedCategories.length,
                benefitCount: benefits.length,
                coveredBenefitCount
            },
            categories: serializedCategories
        }, 'Plan benefits fetched');
    } catch (err) {
        return next(err);
    }
}

module.exports = {
    listPublicPlans,
    getPublicPlanBenefits
};
