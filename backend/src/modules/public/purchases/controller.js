'use strict';

const axios = require('axios');
const bcrypt = require('bcrypt');
const { Op } = require('sequelize');
const notify = require('../../../utils/notify');
const generateCode = require('../../../utils/verificationCode');
const { getUniquePolicyNumber } = require('../../../utils/policyNumberGenerator');
const { getNextSubscriptionReferenceNumber } = require('../../../utils/subscriptionReferenceNumberGenerator');
const { calculateEndDateFromCycle, generatePaymentReference } = require('../../../utils/subscriptionCalculationHelper');

const INTERNATIONAL_GATEWAYS = ['paypal', 'stripe'];

function getGatewayName(integration) {
    const name = String(integration.name || '').toLowerCase();
    const provider = String(integration.additional_config?.provider || '').toLowerCase();
    if (name.includes('paypal') || provider.includes('paypal')) return 'paypal';
    if (name.includes('stripe') || provider.includes('stripe')) return 'stripe';
    return null;
}

function integrationIsProduction(integration) {
    const name = String(integration.name || '').toLowerCase();
    const environment = String(integration.additional_config?.environment || '').toLowerCase();
    return name.includes('production') || environment === 'production' || environment === 'live';
}

async function getActiveGatewayIntegrations(Integration) {
    const integrations = await Integration.findAll({
        where: {
            is_active: true,
            is_deleted: false,
            [Op.or]: [
                { name: { [Op.iLike]: '%paypal%' } },
                { name: { [Op.iLike]: '%stripe%' } }
            ]
        },
        order: [['created_at', 'DESC']]
    });

    return integrations
        .map((integration) => ({ integration, provider: getGatewayName(integration) }))
        .filter((item) => item.provider && INTERNATIONAL_GATEWAYS.includes(item.provider));
}

function chooseIntegration(items, provider) {
    const matches = items.filter((item) => item.provider === provider);
    if (matches.length === 0) return null;

    if (process.env.NODE_ENV === 'production') {
        return matches.find((item) => integrationIsProduction(item.integration)) || matches[0];
    }

    return matches.find((item) => !integrationIsProduction(item.integration)) || matches[0];
}

function getPlanAmount(plan) {
    return Number(plan.annualPremiumPrice || 0);
}

function getOrigin(req) {
    const origin = req.get('origin') || req.get('referer');
    if (origin) {
        try {
            return new URL(origin).origin;
        } catch (err) {
            return 'https://landing.altuhealth.com';
        }
    }
    return process.env.LANDING_URL || 'https://landing.altuhealth.com';
}

function getPaypalBaseUrl(integration) {
    return integration.base_url || (integrationIsProduction(integration) ? 'https://api.paypal.com' : 'https://api.sandbox.paypal.com');
}

async function getPaypalAccessToken(integration) {
    const credentials = Buffer.from(`${integration.api_key}:${integration.secret_key || integration.api_secret}`).toString('base64');
    const response = await axios.post(
        `${getPaypalBaseUrl(integration)}/v1/oauth2/token`,
        'grant_type=client_credentials',
        {
            headers: {
                Authorization: `Basic ${credentials}`,
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        }
    );

    return response.data.access_token;
}

async function createPaypalCheckout(req, integration, plan) {
    const accessToken = await getPaypalAccessToken(integration);
    const origin = getOrigin(req);
    const response = await axios.post(
        `${getPaypalBaseUrl(integration)}/v2/checkout/orders`,
        {
            intent: 'CAPTURE',
            purchase_units: [
                {
                    reference_id: plan.id,
                    description: plan.name,
                    amount: {
                        currency_code: plan.currency || 'GBP',
                        value: getPlanAmount(plan).toFixed(2)
                    }
                }
            ],
            application_context: {
                return_url: `${origin}/?payment_status=success&gateway=paypal`,
                cancel_url: `${origin}/?payment_status=cancelled&gateway=paypal`,
                user_action: 'PAY_NOW'
            }
        },
        {
            headers: {
                Authorization: `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            }
        }
    );

    const approvalUrl = response.data.links?.find((link) => link.rel === 'approve')?.href;
    if (!approvalUrl) throw new Error('PayPal approval URL was not returned');

    return {
        checkoutUrl: approvalUrl,
        checkoutReference: response.data.id
    };
}

async function createStripeCheckout(req, integration, plan) {
    const origin = getOrigin(req);
    const secret = integration.secret_key || integration.api_secret;
    const params = new URLSearchParams();
    params.append('mode', 'payment');
    params.append('success_url', `${origin}/?payment_status=success&gateway=stripe&session_id={CHECKOUT_SESSION_ID}`);
    params.append('cancel_url', `${origin}/?payment_status=cancelled&gateway=stripe`);
    params.append('line_items[0][quantity]', '1');
    params.append('line_items[0][price_data][currency]', String(plan.currency || 'GBP').toLowerCase());
    params.append('line_items[0][price_data][unit_amount]', String(Math.round(getPlanAmount(plan) * 100)));
    params.append('line_items[0][price_data][product_data][name]', plan.name);
    params.append('metadata[planId]', plan.id);

    const response = await axios.post('https://api.stripe.com/v1/checkout/sessions', params, {
        headers: {
            Authorization: `Bearer ${secret}`,
            'Content-Type': 'application/x-www-form-urlencoded'
        }
    });

    return {
        checkoutUrl: response.data.url,
        checkoutReference: response.data.id
    };
}

async function verifyStripePayment(integration, checkoutReference) {
    const secret = integration.secret_key || integration.api_secret;
    const response = await axios.get(`https://api.stripe.com/v1/checkout/sessions/${checkoutReference}`, {
        headers: { Authorization: `Bearer ${secret}` }
    });

    if (response.data.payment_status !== 'paid') {
        throw new Error('Stripe payment is not completed');
    }

    return {
        transactionId: response.data.payment_intent || response.data.id,
        amount: Number(response.data.amount_total || 0) / 100,
        currency: String(response.data.currency || '').toUpperCase()
    };
}

async function capturePaypalPayment(integration, checkoutReference) {
    const accessToken = await getPaypalAccessToken(integration);
    const response = await axios.post(
        `${getPaypalBaseUrl(integration)}/v2/checkout/orders/${checkoutReference}/capture`,
        {},
        {
            headers: {
                Authorization: `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            }
        }
    );

    if (response.data.status !== 'COMPLETED') {
        throw new Error('PayPal payment is not completed');
    }

    const capture = response.data.purchase_units?.[0]?.payments?.captures?.[0];
    return {
        transactionId: capture?.id || response.data.id,
        amount: Number(capture?.amount?.value || 0),
        currency: capture?.amount?.currency_code || 'GBP'
    };
}

async function listGateways(req, res, next) {
    try {
        const { Integration } = req.models;
        const { market } = req.query;

        if (market === 'NGN') {
            return res.success({ gateways: [] }, 'No payment gateway available for Nigeria');
        }

        const items = await getActiveGatewayIntegrations(Integration);
        const gateways = INTERNATIONAL_GATEWAYS
            .filter((provider) => chooseIntegration(items, provider))
            .map((provider) => ({ provider, label: provider === 'paypal' ? 'PayPal' : 'Stripe' }));

        return res.success({ gateways }, 'Payment gateways fetched');
    } catch (err) {
        return next(err);
    }
}

async function createCheckout(req, res, next) {
    try {
        const { Plan, Integration, RetailEnrollee } = req.models;
        const { planId, gateway, email, phoneNumber } = req.body || {};

        if (!planId) return res.fail('`planId` is required', 400);
        if (!gateway) return res.fail('`gateway` is required', 400);
        if (!email) return res.fail('`email` is required', 400);
        if (!phoneNumber) return res.fail('`phoneNumber` is required', 400);

        const plan = await Plan.findByPk(planId);
        if (!plan) return res.fail('Plan not found', 404);
        if (plan.currency === 'NGN') return res.fail('No payment gateway available for Nigeria', 400);

        const existingEmail = await RetailEnrollee.findOne({ where: { email } });
        if (existingEmail) return res.fail('Email already exists', 400);
        const existingPhone = await RetailEnrollee.findOne({ where: { phoneNumber } });
        if (existingPhone) return res.fail('Phone number already exists', 400);

        const items = await getActiveGatewayIntegrations(Integration);
        const selected = chooseIntegration(items, String(gateway).toLowerCase());
        if (!selected) return res.fail('Selected payment gateway is not available', 400);

        const checkout = selected.provider === 'paypal'
            ? await createPaypalCheckout(req, selected.integration, plan)
            : await createStripeCheckout(req, selected.integration, plan);

        return res.success({
            gateway: selected.provider,
            plan: { id: plan.id, name: plan.name, amount: getPlanAmount(plan), currency: plan.currency },
            ...checkout
        }, 'Checkout created');
    } catch (err) {
        return next(err);
    }
}

async function completePurchase(req, res, next) {
    try {
        const { Plan, Integration, RetailEnrollee, RetailEnrolleeSubscription } = req.models;
        const {
            planId,
            gateway,
            checkoutReference,
            firstName,
            lastName,
            phoneNumber,
            email,
            dateOfBirth,
            referralCode
        } = req.body || {};

        if (!planId) return res.fail('`planId` is required', 400);
        if (!gateway) return res.fail('`gateway` is required', 400);
        if (!checkoutReference) return res.fail('`checkoutReference` is required', 400);
        if (!firstName) return res.fail('`firstName` is required', 400);
        if (!lastName) return res.fail('`lastName` is required', 400);
        if (!phoneNumber) return res.fail('`phoneNumber` is required', 400);
        if (!email) return res.fail('`email` is required', 400);
        if (!dateOfBirth) return res.fail('`dateOfBirth` is required', 400);

        const plan = await Plan.findByPk(planId);
        if (!plan) return res.fail('Plan not found', 404);
        if (plan.currency === 'NGN') return res.fail('No payment gateway available for Nigeria', 400);

        const existingEmail = await RetailEnrollee.findOne({ where: { email } });
        if (existingEmail) return res.fail('Email already exists', 400);
        const existingPhone = await RetailEnrollee.findOne({ where: { phoneNumber } });
        if (existingPhone) return res.fail('Phone number already exists', 400);

        const items = await getActiveGatewayIntegrations(Integration);
        const selected = chooseIntegration(items, String(gateway).toLowerCase());
        if (!selected) return res.fail('Selected payment gateway is not available', 400);

        const payment = selected.provider === 'paypal'
            ? await capturePaypalPayment(selected.integration, checkoutReference)
            : await verifyStripePayment(selected.integration, checkoutReference);

        const rawPassword = generateCode(10, { letters: true, numbers: true });
        const hashedPassword = await bcrypt.hash(rawPassword, 10);
        const policyNumber = await getUniquePolicyNumber(RetailEnrollee);
        const subscriptionStartDate = new Date();
        const planCycle = plan.planCycle || 'annual';
        const subscriptionEndDate = calculateEndDateFromCycle(subscriptionStartDate, planCycle);
        const transaction = await RetailEnrollee.sequelize.transaction();

        let enrollee;
        let subscription;
        try {
            enrollee = await RetailEnrollee.create({
                firstName,
                middleName: null,
                lastName,
                policyNumber,
                phoneNumber,
                email,
                dateOfBirth,
                state: null,
                lga: null,
                country: plan.currency === 'GBP' ? 'United Kingdom' : null,
                maxDependents: plan.allowDependentEnrolee ? 1 : 0,
                planId,
                subscriptionStartDate,
                subscriptionEndDate,
                soldByUserId: null,
                isActive: true,
                password: hashedPassword,
                referralCode: referralCode || null
            }, { transaction });

            const referenceNumber = await getNextSubscriptionReferenceNumber(RetailEnrolleeSubscription);
            const transactionReference = generatePaymentReference();
            subscription = await RetailEnrolleeSubscription.create({
                referenceNumber,
                retailEnrolleeId: enrollee.id,
                planId,
                planCycle,
                amountPaid: payment.amount || getPlanAmount(plan),
                currency: payment.currency || plan.currency || 'GBP',
                datePaid: new Date(),
                subscriptionStartDate,
                subscriptionEndDate,
                paymentMethod: 'card',
                transactionReference,
                paymentGatewayProvider: selected.provider,
                paymentGatewayTransactionId: payment.transactionId,
                status: 'active',
                isRenewal: false,
                previousSubscriptionId: null,
                notes: `Landing purchase via ${selected.provider}`
            }, { transaction });

            await transaction.commit();
        } catch (dbErr) {
            await transaction.rollback();
            throw dbErr;
        }

        try {
            await notify(
                { id: enrollee.id, email: enrollee.email, firstName: enrollee.firstName },
                'retail_enrollee',
                'RETAIL_ENROLLEE_ENROLLMENT',
                {
                    firstName: enrollee.firstName,
                    policyNumber: enrollee.policyNumber,
                    temporaryPassword: rawPassword,
                    loginLink: 'https://enrollee.altuhealth.com/signin',
                    planName: plan.name,
                    subscriptionStartDate: subscriptionStartDate.toLocaleDateString('en-NG')
                },
                ['email'],
                true
            );
        } catch (notifyErr) {
            console.error('Failed to send retail enrollee enrollment notification', notifyErr);
        }

        return res.success({
            enrollee: {
                id: enrollee.id,
                firstName: enrollee.firstName,
                lastName: enrollee.lastName,
                email: enrollee.email,
                policyNumber: enrollee.policyNumber
            },
            subscription: subscription.toJSON(),
            loginLink: 'https://enrollee.altuhealth.com/signin'
        }, 'Purchase completed and account created', 201);
    } catch (err) {
        return next(err);
    }
}

module.exports = {
    listGateways,
    createCheckout,
    completePurchase
};
