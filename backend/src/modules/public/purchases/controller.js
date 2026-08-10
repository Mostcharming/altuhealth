'use strict';

const axios = require('axios');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const notify = require('../../../utils/notify');
const generateCode = require('../../../utils/verificationCode');
const { getUniquePolicyNumber } = require('../../../utils/policyNumberGenerator');
const { getNextSubscriptionReferenceNumber } = require('../../../utils/subscriptionReferenceNumberGenerator');
const { calculateEndDateFromCycle, generatePaymentReference } = require('../../../utils/subscriptionCalculationHelper');

const INTERNATIONAL_GATEWAYS = ['paypal', 'stripe'];
const LOCAL_GATEWAYS = ['flutterwave'];
const ALL_GATEWAYS = [...LOCAL_GATEWAYS, ...INTERNATIONAL_GATEWAYS];

function getGatewayName(integration) {
    const name = String(integration.name || '').toLowerCase();
    const provider = String(integration.additional_config?.provider || '').toLowerCase();
    if (name.includes('flutterwave') || provider.includes('flutterwave')) return 'flutterwave';
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
            is_deleted: false
        },
        order: [['created_at', 'DESC']]
    });

    return integrations
        .map((integration) => ({ integration, provider: getGatewayName(integration) }))
        .filter((item) => item.provider && ALL_GATEWAYS.includes(item.provider));
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

function normalizeCurrency(value, fallback = '') {
    const currency = String(value || '').trim().toUpperCase();
    return /^[A-Z]{3}$/.test(currency) ? currency : fallback;
}

function getPlainPlan(plan) {
    if (typeof plan?.get === 'function') return plan.get({ plain: true });
    if (typeof plan?.toJSON === 'function') return plan.toJSON();
    return { ...plan };
}

function roundPaymentAmount(amount) {
    return Math.round((Number(amount) + Number.EPSILON) * 100) / 100;
}

async function resolveCheckoutPlan(plan, requestedCurrency, CurrencyRate) {
    const sourceCurrency = normalizeCurrency(plan.currency, 'NGN');
    const targetCurrency = normalizeCurrency(requestedCurrency, sourceCurrency);
    const sourceAmount = getPlanAmount(plan);
    const plainPlan = getPlainPlan(plan);

    if (targetCurrency === sourceCurrency) {
        return {
            ...plainPlan,
            annualPremiumPrice: sourceAmount,
            currency: sourceCurrency,
            sourceAmount,
            sourceCurrency
        };
    }

    if (targetCurrency !== 'NGN') {
        throw new Error(`Checkout conversion to ${targetCurrency} is not supported`);
    }

    const sourceRate = sourceCurrency === 'NGN'
        ? { rateToNgn: 1 }
        : await CurrencyRate.findOne({
            where: {
                currencyCode: sourceCurrency,
                isActive: true
            }
        });
    const rateToNgn = Number(sourceRate?.rateToNgn);

    if (!Number.isFinite(rateToNgn) || rateToNgn <= 0) {
        throw new Error(`An active ${sourceCurrency} to NGN exchange rate is required`);
    }

    return {
        ...plainPlan,
        annualPremiumPrice: roundPaymentAmount(sourceAmount * rateToNgn),
        currency: 'NGN',
        sourceAmount,
        sourceCurrency
    };
}

function parseDateOfBirth(value) {
    if (value instanceof Date && !Number.isNaN(value.getTime())) {
        return new Date(Date.UTC(value.getUTCFullYear(), value.getUTCMonth(), value.getUTCDate()));
    }

    const normalized = String(value || '').trim();
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(normalized);
    if (!match) return null;

    const year = Number(match[1]);
    const month = Number(match[2]);
    const day = Number(match[3]);
    const date = new Date(Date.UTC(year, month - 1, day));
    if (
        date.getUTCFullYear() !== year
        || date.getUTCMonth() !== month - 1
        || date.getUTCDate() !== day
    ) return null;

    return date;
}

function calculateAge(dateOfBirth, now = new Date()) {
    let age = now.getUTCFullYear() - dateOfBirth.getUTCFullYear();
    const birthdayHasPassed = now.getUTCMonth() > dateOfBirth.getUTCMonth()
        || (
            now.getUTCMonth() === dateOfBirth.getUTCMonth()
            && now.getUTCDate() >= dateOfBirth.getUTCDate()
        );
    if (!birthdayHasPassed) age -= 1;
    return age;
}

function validateDateOfBirthForPlan(value, plan, now = new Date()) {
    const dateOfBirth = parseDateOfBirth(value);
    if (!dateOfBirth) {
        return { error: '`dateOfBirth` must be a valid date in YYYY-MM-DD format' };
    }

    const today = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
    if (dateOfBirth > today) {
        return { error: '`dateOfBirth` cannot be in the future' };
    }

    const age = calculateAge(dateOfBirth, today);
    const ageLimit = plan?.ageLimit === null || plan?.ageLimit === undefined
        ? null
        : Number(plan.ageLimit);
    if (Number.isFinite(ageLimit) && age > ageLimit) {
        return { error: `This plan is only available to enrollees aged ${ageLimit} or younger` };
    }

    return { dateOfBirth, age };
}

function validateGatewayForPlan(plan, gateway) {
    const currency = String(plan.currency || 'NGN').toUpperCase();
    const provider = String(gateway || '').toLowerCase();
    if (currency === 'NGN' && provider !== 'flutterwave') {
        return 'NGN plans must be paid with Flutterwave';
    }
    if (currency !== 'NGN' && provider === 'flutterwave') {
        return 'Flutterwave is only available for NGN plans';
    }
    return null;
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

function getCheckoutReturnUrl(req) {
    const requested = String(req.body?.returnUrl || '').trim();

    if (requested && req.user?.type === 'RetailEnrollee') {
        try {
            const parsed = new URL(requested);
            if (['altuhealth:', 'exp:'].includes(parsed.protocol)) {
                return requested;
            }
            const requestOrigin = req.get('origin');
            const portalOrigin = new URL(
                process.env.FE_ENROLLEE_URL || 'https://enrollee.altuhealth.com'
            ).origin;
            if (
                ['http:', 'https:'].includes(parsed.protocol)
                && [requestOrigin, portalOrigin].filter(Boolean).includes(parsed.origin)
            ) return requested;
        } catch (err) {
            // Fall back to the caller origin when the supplied URL is invalid.
        }
    }

    return `${getOrigin(req)}/`;
}

function withCheckoutParams(returnUrl, params) {
    const separator = returnUrl.includes('?') ? '&' : '?';
    return `${returnUrl}${separator}${params}`;
}

function getPaypalBaseUrl(integration) {
    return integration.base_url || (integrationIsProduction(integration) ? 'https://api.paypal.com' : 'https://api.sandbox.paypal.com');
}

function getFlutterwaveBaseUrl(integration) {
    return integration.base_url || 'https://api.flutterwave.com';
}

function getFlutterwaveSecret(integration) {
    return integration.secret_key || integration.api_secret;
}

function createFlutterwavePayloadHash({ amount, currency, email, transactionReference, secret }) {
    const hashedSecret = crypto.createHash('sha256').update(secret, 'utf8').digest('hex');
    return crypto
        .createHash('sha256')
        .update(`${amount}${currency}${email}${transactionReference}${hashedSecret}`, 'utf8')
        .digest('hex');
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
    const returnUrl = getCheckoutReturnUrl(req);
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
                return_url: withCheckoutParams(returnUrl, 'payment_status=success&gateway=paypal'),
                cancel_url: withCheckoutParams(returnUrl, 'payment_status=cancelled&gateway=paypal'),
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
    const returnUrl = getCheckoutReturnUrl(req);
    const secret = integration.secret_key || integration.api_secret;
    const params = new URLSearchParams();
    params.append('mode', 'payment');
    params.append('success_url', withCheckoutParams(returnUrl, 'payment_status=success&gateway=stripe&session_id={CHECKOUT_SESSION_ID}'));
    params.append('cancel_url', withCheckoutParams(returnUrl, 'payment_status=cancelled&gateway=stripe'));
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

async function createFlutterwaveCheckout(req, integration, plan, customer) {
    const returnUrl = getCheckoutReturnUrl(req);
    const secret = getFlutterwaveSecret(integration);
    if (!secret) throw new Error('Flutterwave secret key is not configured');

    const amount = getPlanAmount(plan);
    const currency = String(plan.currency || 'NGN').toUpperCase();
    const transactionReference = generatePaymentReference();
    const email = String(customer.email || '').trim();
    const payloadHash = createFlutterwavePayloadHash({
        amount,
        currency,
        email,
        transactionReference,
        secret
    });

    const response = await axios.post(
        `${getFlutterwaveBaseUrl(integration)}/v3/payments`,
        {
            tx_ref: transactionReference,
            amount,
            currency,
            redirect_url: withCheckoutParams(returnUrl, 'payment_status=callback&gateway=flutterwave'),
            customer: {
                email,
                name: [customer.firstName, customer.lastName].filter(Boolean).join(' '),
                phonenumber: customer.phoneNumber
            },
            meta: {
                planId: plan.id,
                planName: plan.name,
                paymentAmount: amount.toFixed(2),
                paymentCurrency: currency,
                sourceAmount: Number(plan.sourceAmount ?? amount).toFixed(2),
                sourceCurrency: normalizeCurrency(plan.sourceCurrency, currency)
            },
            customizations: {
                title: 'AltuHealth Plan Payment',
                description: plan.name
            },
            payload_hash: payloadHash,
            configurations: {
                max_retry_attempt: 5
            }
        },
        {
            headers: {
                Authorization: `Bearer ${secret}`,
                'Content-Type': 'application/json'
            }
        }
    );

    const data = response.data?.data || {};
    if (response.data?.status !== 'success' || !data.link) {
        throw new Error('Flutterwave checkout URL was not returned');
    }

    return {
        checkoutUrl: data.link,
        checkoutReference: transactionReference
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

async function verifyFlutterwavePayment(integration, transactionId, {
    checkoutReference,
    expectedAmount,
    expectedCurrency,
    expectedPlanId,
    expectedEmail,
    requireCheckoutAmount = false
} = {}) {
    const secret = getFlutterwaveSecret(integration);
    if (!secret) throw new Error('Flutterwave secret key is not configured');
    if (!transactionId) throw new Error('Flutterwave transaction ID is required');

    const response = await axios.get(
        `${getFlutterwaveBaseUrl(integration)}/v3/transactions/${encodeURIComponent(transactionId)}/verify`,
        {
            headers: { Authorization: `Bearer ${secret}` }
        }
    );

    const data = response.data?.data || {};
    if (response.data?.status !== 'success' || data.status !== 'successful') {
        throw new Error('Flutterwave payment is not completed');
    }
    if (checkoutReference && String(data.tx_ref) !== String(checkoutReference)) {
        throw new Error('Flutterwave transaction reference does not match this checkout');
    }

    const currency = String(data.currency || '').toUpperCase();
    if (expectedCurrency && currency !== String(expectedCurrency).toUpperCase()) {
        throw new Error('Flutterwave payment currency does not match the selected plan');
    }

    const amount = Number(data.amount ?? data.charged_amount ?? 0);
    const checkoutAmount = Number(data.meta?.paymentAmount);
    const hasCheckoutAmount = Number.isFinite(checkoutAmount) && checkoutAmount > 0;
    if (requireCheckoutAmount && !hasCheckoutAmount) {
        throw new Error('Flutterwave checkout amount could not be verified');
    }
    const amountToVerify = hasCheckoutAmount ? checkoutAmount : expectedAmount;
    if (amountToVerify !== undefined && (!Number.isFinite(amount) || amount + 0.01 < Number(amountToVerify))) {
        throw new Error('Flutterwave payment amount does not match the selected plan');
    }
    if (
        data.meta?.paymentCurrency
        && currency !== normalizeCurrency(data.meta.paymentCurrency)
    ) {
        throw new Error('Flutterwave payment currency does not match this checkout');
    }
    if (expectedPlanId && String(data.meta?.planId || '') !== String(expectedPlanId)) {
        throw new Error('Flutterwave payment plan does not match the selected plan');
    }
    if (
        expectedEmail
        && String(data.customer?.email || '').trim().toLowerCase()
            !== String(expectedEmail).trim().toLowerCase()
    ) {
        throw new Error('Flutterwave payment customer does not match this checkout');
    }

    return {
        transactionId: data.id ? String(data.id) : String(transactionId),
        transactionReference: data.tx_ref || checkoutReference,
        amount,
        currency
    };
}

function getGatewayLabel(provider) {
    if (provider === 'flutterwave') return 'Flutterwave';
    if (provider === 'paypal') return 'PayPal';
    return 'Stripe';
}

function getProvidersForCurrency(currency) {
    return String(currency || '').toUpperCase() === 'NGN'
        ? LOCAL_GATEWAYS
        : INTERNATIONAL_GATEWAYS;
}

async function listGateways(req, res, next) {
    try {
        const { Integration } = req.models;
        const currency = String(req.query.currency || req.query.market || '').toUpperCase();
        const providers = getProvidersForCurrency(currency);

        const items = await getActiveGatewayIntegrations(Integration);
        const gateways = providers
            .filter((provider) => chooseIntegration(items, provider))
            .map((provider) => ({ provider, label: getGatewayLabel(provider) }));

        return res.success({ gateways }, 'Payment gateways fetched');
    } catch (err) {
        return next(err);
    }
}

async function createCheckout(req, res, next) {
    try {
        const { Plan, Integration, RetailEnrollee, CurrencyRate } = req.models;
        const {
            planId,
            gateway,
            paymentCurrency,
            firstName,
            lastName,
            email,
            phoneNumber,
            dateOfBirth
        } = req.body || {};

        if (!planId) return res.fail('`planId` is required', 400);
        if (!gateway) return res.fail('`gateway` is required', 400);
        if (!firstName) return res.fail('`firstName` is required', 400);
        if (!lastName) return res.fail('`lastName` is required', 400);
        if (!email) return res.fail('`email` is required', 400);
        if (!phoneNumber) return res.fail('`phoneNumber` is required', 400);
        if (!dateOfBirth) return res.fail('`dateOfBirth` is required', 400);

        const plan = await Plan.findByPk(planId);
        if (!plan) return res.fail('Plan not found', 404);
        const gatewayProvider = String(gateway).toLowerCase();
        let checkoutPlan;
        try {
            checkoutPlan = await resolveCheckoutPlan(plan, paymentCurrency, CurrencyRate);
        } catch (conversionError) {
            return res.fail(conversionError.message, 400);
        }
        const gatewayError = validateGatewayForPlan(checkoutPlan, gatewayProvider);
        if (gatewayError) return res.fail(gatewayError, 400);

        const dateOfBirthResult = validateDateOfBirthForPlan(dateOfBirth, plan);
        if (dateOfBirthResult.error) return res.fail(dateOfBirthResult.error, 400);

        const existingEmail = await RetailEnrollee.findOne({ where: { email } });
        if (existingEmail) return res.fail('Email already exists', 400);
        const existingPhone = await RetailEnrollee.findOne({ where: { phoneNumber } });
        if (existingPhone) return res.fail('Phone number already exists', 400);

        const items = await getActiveGatewayIntegrations(Integration);
        const selected = chooseIntegration(items, gatewayProvider);
        if (!selected) return res.fail('Selected payment gateway is not available', 400);

        const checkout = selected.provider === 'flutterwave'
            ? await createFlutterwaveCheckout(req, selected.integration, checkoutPlan, {
                firstName,
                lastName,
                email,
                phoneNumber
            })
            : selected.provider === 'paypal'
                ? await createPaypalCheckout(req, selected.integration, checkoutPlan)
                : await createStripeCheckout(req, selected.integration, checkoutPlan);

        return res.success({
            gateway: selected.provider,
            plan: {
                id: plan.id,
                name: plan.name,
                amount: getPlanAmount(checkoutPlan),
                currency: checkoutPlan.currency,
                sourceAmount: checkoutPlan.sourceAmount,
                sourceCurrency: checkoutPlan.sourceCurrency
            },
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
        const gatewayProvider = String(gateway).toLowerCase();
        if (gatewayProvider !== 'flutterwave') {
            const gatewayError = validateGatewayForPlan(plan, gatewayProvider);
            if (gatewayError) return res.fail(gatewayError, 400);
        }

        const dateOfBirthResult = validateDateOfBirthForPlan(dateOfBirth, plan);
        if (dateOfBirthResult.error) return res.fail(dateOfBirthResult.error, 400);

        const items = await getActiveGatewayIntegrations(Integration);
        const selected = chooseIntegration(items, gatewayProvider);
        if (!selected) return res.fail('Selected payment gateway is not available', 400);

        const payment = selected.provider === 'flutterwave'
            ? await verifyFlutterwavePayment(selected.integration, req.body?.transactionId, {
                checkoutReference,
                expectedAmount: normalizeCurrency(plan.currency, 'NGN') === 'NGN'
                    ? getPlanAmount(plan)
                    : undefined,
                expectedCurrency: 'NGN',
                expectedPlanId: plan.id,
                expectedEmail: email,
                requireCheckoutAmount: normalizeCurrency(plan.currency, 'NGN') !== 'NGN'
            })
            : selected.provider === 'paypal'
                ? await capturePaypalPayment(selected.integration, checkoutReference)
                : await verifyStripePayment(selected.integration, checkoutReference);

        if (selected.provider !== 'flutterwave') {
            if (String(payment.currency || '').toUpperCase() !== String(plan.currency || 'NGN').toUpperCase()) {
                return res.fail('Payment currency does not match the selected plan', 400);
            }
            if (Number(payment.amount || 0) + 0.01 < getPlanAmount(plan)) {
                return res.fail('Payment amount does not match the selected plan', 400);
            }
        }

        const existingPayment = await RetailEnrolleeSubscription.findOne({
            where: {
                paymentGatewayProvider: selected.provider,
                paymentGatewayTransactionId: payment.transactionId
            }
        });
        if (existingPayment) {
            const existingEnrollee = await RetailEnrollee.findByPk(existingPayment.retailEnrolleeId);
            if (existingEnrollee && String(existingEnrollee.email).toLowerCase() === String(email).toLowerCase()) {
                return res.success({
                    enrollee: {
                        id: existingEnrollee.id,
                        firstName: existingEnrollee.firstName,
                        lastName: existingEnrollee.lastName,
                        email: existingEnrollee.email,
                        policyNumber: existingEnrollee.policyNumber
                    },
                    subscription: existingPayment.toJSON(),
                    loginLink: 'https://enrollee.altuhealth.com/signin'
                }, 'Purchase was already completed and the account is ready');
            }
            return res.fail('This payment transaction has already been used', 409);
        }

        const existingEmail = await RetailEnrollee.findOne({ where: { email } });
        if (existingEmail) return res.fail('Email already exists', 400);
        const existingPhone = await RetailEnrollee.findOne({ where: { phoneNumber } });
        if (existingPhone) return res.fail('Phone number already exists', 400);

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
                dateOfBirth: dateOfBirthResult.dateOfBirth,
                state: null,
                lga: null,
                country: plan.currency === 'GBP' ? 'United Kingdom' : null,
                maxDependents: plan.allowDependentEnrolee
                    ? plan.maxNumberOfDependents
                    : 0,
                planId,
                subscriptionStartDate,
                subscriptionEndDate,
                soldByUserId: null,
                isActive: true,
                password: hashedPassword,
                referralCode: referralCode || null
            }, { transaction });

            const referenceNumber = await getNextSubscriptionReferenceNumber(RetailEnrolleeSubscription);
            const transactionReference = payment.transactionReference || generatePaymentReference();
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
    completePurchase,
    checkoutHelpers: {
        getActiveGatewayIntegrations,
        chooseIntegration,
        getPlanAmount,
        createPaypalCheckout,
        createStripeCheckout,
        createFlutterwaveCheckout,
        verifyStripePayment,
        capturePaypalPayment,
        verifyFlutterwavePayment,
        getProvidersForCurrency,
        getGatewayLabel,
        validateGatewayForPlan,
        resolveCheckoutPlan,
        parseDateOfBirth,
        calculateAge,
        validateDateOfBirthForPlan
    }
};
