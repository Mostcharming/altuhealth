'use strict';

const { Op } = require('sequelize');
const {
    checkoutHelpers
} = require('../../public/purchases/controller');
const {
    getNextSubscriptionReferenceNumber
} = require('../../../utils/subscriptionReferenceNumberGenerator');
const {
    calculateEndDateFromCycle,
    generatePaymentReference
} = require('../../../utils/subscriptionCalculationHelper');

function ensureRetailEnrollee(req, res) {
    if (req.user?.type !== 'RetailEnrollee') {
        res.fail('Subscription management is only available to retail enrollees', 403);
        return false;
    }
    return true;
}

function planSummary(plan) {
    if (!plan) return null;
    const value = typeof plan.toJSON === 'function' ? plan.toJSON() : plan;
    return {
        id: value.id,
        name: value.name,
        code: value.code,
        description: value.description,
        planCycle: value.planCycle || 'annual',
        amount: Number(value.annualPremiumPrice || 0),
        currency: value.currency || 'NGN',
        allowDependentEnrolee: Boolean(value.allowDependentEnrolee),
        maxNumberOfDependents: value.maxNumberOfDependents || 0
    };
}

function subscriptionSummary(subscription) {
    if (!subscription) return null;
    const value = typeof subscription.toJSON === 'function'
        ? subscription.toJSON()
        : subscription;
    return {
        id: value.id,
        referenceNumber: value.referenceNumber,
        planId: value.planId,
        plan: planSummary(value.plan),
        planCycle: value.planCycle,
        amountPaid: Number(value.amountPaid || 0),
        currency: value.currency,
        datePaid: value.datePaid,
        subscriptionStartDate: value.subscriptionStartDate,
        subscriptionEndDate: value.subscriptionEndDate,
        status: value.status,
        isRenewal: Boolean(value.isRenewal),
        createdAt: value.createdAt
    };
}

function validateGatewayForPlan(plan, gateway) {
    const currency = String(plan.currency || 'NGN').toUpperCase();
    const provider = String(gateway || '').toLowerCase();
    if (currency === 'NGN' && provider !== 'paystack') {
        return 'NGN plans must be paid with Paystack';
    }
    if (currency !== 'NGN' && provider === 'paystack') {
        return 'Paystack is only available for NGN plans';
    }
    return null;
}

async function findAvailablePlans(Plan) {
    return Plan.findAll({
        where: {
            isActive: true,
            isApproved: true,
            status: { [Op.in]: ['approved', 'active'] }
        },
        order: [['name', 'ASC']]
    });
}

async function getSubscriptionOverview(req, res, next) {
    try {
        if (!ensureRetailEnrollee(req, res)) return;
        const { RetailEnrolleeSubscription, Plan } = req.models;
        const [subscriptions, plans] = await Promise.all([
            RetailEnrolleeSubscription.findAll({
                where: { retailEnrolleeId: req.user.id },
                include: [{ model: Plan, as: 'plan', required: false }],
                order: [['subscriptionEndDate', 'DESC'], ['createdAt', 'DESC']]
            }),
            findAvailablePlans(Plan)
        ]);

        return res.success({
            current: subscriptionSummary(subscriptions[0]),
            history: subscriptions.map(subscriptionSummary),
            plans: plans.map(planSummary)
        }, 'Subscription details fetched');
    } catch (err) {
        return next(err);
    }
}

async function listGateways(req, res, next) {
    try {
        if (!ensureRetailEnrollee(req, res)) return;
        const currency = String(req.query.currency || 'NGN').toUpperCase();
        const providers = checkoutHelpers.getProvidersForCurrency(currency);
        const items = await checkoutHelpers.getActiveGatewayIntegrations(req.models.Integration);
        const gateways = providers
            .filter((provider) => checkoutHelpers.chooseIntegration(items, provider))
            .map((provider) => ({
                provider,
                label: checkoutHelpers.getGatewayLabel(provider)
            }));

        return res.success({ gateways }, 'Payment gateways fetched');
    } catch (err) {
        return next(err);
    }
}

async function createCheckout(req, res, next) {
    try {
        if (!ensureRetailEnrollee(req, res)) return;
        const { planId, gateway } = req.body || {};
        if (!planId) return res.fail('`planId` is required', 400);
        if (!gateway) return res.fail('`gateway` is required', 400);

        const [plan, enrollee] = await Promise.all([
            req.models.Plan.findOne({
                where: {
                    id: planId,
                    isActive: true,
                    isApproved: true,
                    status: { [Op.in]: ['approved', 'active'] }
                }
            }),
            req.models.RetailEnrollee.findByPk(req.user.id)
        ]);
        if (!plan) return res.fail('Plan not found or unavailable', 404);
        if (!enrollee) return res.fail('Retail enrollee not found', 404);

        const gatewayError = validateGatewayForPlan(plan, gateway);
        if (gatewayError) return res.fail(gatewayError, 400);

        const items = await checkoutHelpers.getActiveGatewayIntegrations(req.models.Integration);
        const selected = checkoutHelpers.chooseIntegration(items, String(gateway).toLowerCase());
        if (!selected) return res.fail('Selected payment gateway is not available', 400);

        const checkout = selected.provider === 'paystack'
            ? await checkoutHelpers.createPaystackCheckout(req, selected.integration, plan, enrollee.email)
            : selected.provider === 'paypal'
                ? await checkoutHelpers.createPaypalCheckout(req, selected.integration, plan)
                : await checkoutHelpers.createStripeCheckout(req, selected.integration, plan);

        return res.success({
            gateway: selected.provider,
            plan: planSummary(plan),
            ...checkout
        }, 'Subscription checkout created');
    } catch (err) {
        return next(err);
    }
}

async function completeCheckout(req, res, next) {
    try {
        if (!ensureRetailEnrollee(req, res)) return;
        const { planId, gateway, checkoutReference, mode = 'renew' } = req.body || {};
        if (!planId) return res.fail('`planId` is required', 400);
        if (!gateway) return res.fail('`gateway` is required', 400);
        if (!checkoutReference) return res.fail('`checkoutReference` is required', 400);
        if (!['renew', 'change'].includes(mode)) {
            return res.fail('`mode` must be either renew or change', 400);
        }

        const { Plan, Integration, RetailEnrollee, RetailEnrolleeSubscription } = req.models;
        const checkoutNote = `Self-service ${mode} checkout ${checkoutReference}`;
        const existing = await RetailEnrolleeSubscription.findOne({
            where: { retailEnrolleeId: req.user.id, notes: checkoutNote },
            include: [{ model: Plan, as: 'plan', required: false }]
        });
        if (existing) {
            return res.success({ subscription: subscriptionSummary(existing) }, 'Subscription already updated');
        }

        const [plan, enrollee] = await Promise.all([
            Plan.findOne({
                where: {
                    id: planId,
                    isActive: true,
                    isApproved: true,
                    status: { [Op.in]: ['approved', 'active'] }
                }
            }),
            RetailEnrollee.findByPk(req.user.id)
        ]);
        if (!plan) return res.fail('Plan not found or unavailable', 404);
        if (!enrollee) return res.fail('Retail enrollee not found', 404);

        const gatewayError = validateGatewayForPlan(plan, gateway);
        if (gatewayError) return res.fail(gatewayError, 400);

        const items = await checkoutHelpers.getActiveGatewayIntegrations(Integration);
        const selected = checkoutHelpers.chooseIntegration(items, String(gateway).toLowerCase());
        if (!selected) return res.fail('Selected payment gateway is not available', 400);

        const payment = selected.provider === 'paystack'
            ? await checkoutHelpers.verifyPaystackPayment(selected.integration, checkoutReference)
            : selected.provider === 'paypal'
                ? await checkoutHelpers.capturePaypalPayment(selected.integration, checkoutReference)
                : await checkoutHelpers.verifyStripePayment(selected.integration, checkoutReference);

        const expectedAmount = checkoutHelpers.getPlanAmount(plan);
        if (payment.currency && String(payment.currency).toUpperCase() !== String(plan.currency || 'NGN').toUpperCase()) {
            return res.fail('Payment currency does not match the selected plan', 400);
        }
        if (Math.abs(Number(payment.amount || 0) - expectedAmount) > 0.01) {
            return res.fail('Payment amount does not match the selected plan', 400);
        }

        const current = await RetailEnrolleeSubscription.findOne({
            where: { retailEnrolleeId: req.user.id },
            order: [['subscriptionEndDate', 'DESC'], ['createdAt', 'DESC']]
        });
        const now = new Date();
        const currentEndDate = current?.subscriptionEndDate
            ? new Date(current.subscriptionEndDate)
            : null;
        const changingPlan = mode === 'change' || (current && String(current.planId) !== String(plan.id));
        const subscriptionStartDate = !changingPlan && currentEndDate && currentEndDate > now
            ? new Date(currentEndDate.getTime() + (24 * 60 * 60 * 1000))
            : now;
        const planCycle = plan.planCycle || 'annual';
        const subscriptionEndDate = calculateEndDateFromCycle(subscriptionStartDate, planCycle);
        const transaction = await RetailEnrollee.sequelize.transaction();

        try {
            if (changingPlan && current?.status === 'active') {
                await current.update({ status: 'cancelled' }, { transaction });
            }

            const referenceNumber = await getNextSubscriptionReferenceNumber(RetailEnrolleeSubscription);
            const subscription = await RetailEnrolleeSubscription.create({
                referenceNumber,
                retailEnrolleeId: enrollee.id,
                planId: plan.id,
                planCycle,
                amountPaid: payment.amount,
                currency: payment.currency || plan.currency || 'NGN',
                datePaid: now,
                subscriptionStartDate,
                subscriptionEndDate,
                paymentMethod: 'card',
                transactionReference: generatePaymentReference(),
                paymentGatewayProvider: selected.provider,
                paymentGatewayTransactionId: payment.transactionId,
                status: 'active',
                isRenewal: Boolean(current),
                previousSubscriptionId: current?.id || null,
                notes: checkoutNote
            }, { transaction });

            await enrollee.update({
                planId: plan.id,
                subscriptionStartDate: changingPlan
                    ? subscriptionStartDate
                    : enrollee.subscriptionStartDate,
                subscriptionEndDate,
                maxDependents: plan.allowDependentEnrolee
                    ? plan.maxNumberOfDependents
                    : 0,
                isActive: true
            }, { transaction });

            await transaction.commit();
            const result = subscription.toJSON();
            result.plan = plan.toJSON();
            return res.success({ subscription: subscriptionSummary(result) }, 'Subscription updated successfully', 201);
        } catch (dbErr) {
            await transaction.rollback();
            throw dbErr;
        }
    } catch (err) {
        return next(err);
    }
}

module.exports = {
    getSubscriptionOverview,
    listGateways,
    createCheckout,
    completeCheckout
};
