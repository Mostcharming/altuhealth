'use strict';

const assert = require('node:assert/strict');
const test = require('node:test');
const axios = require('axios');

const {
    checkoutHelpers
} = require('../src/modules/public/purchases/controller');

test('NGN checkout exposes Flutterwave and rejects other local gateways', () => {
    assert.deepEqual(checkoutHelpers.getProvidersForCurrency('NGN'), ['flutterwave']);
    assert.equal(checkoutHelpers.getGatewayLabel('flutterwave'), 'Flutterwave');
    assert.equal(
        checkoutHelpers.validateGatewayForPlan({ currency: 'NGN' }, 'paystack'),
        'NGN plans must be paid with Flutterwave'
    );
    assert.equal(
        checkoutHelpers.validateGatewayForPlan({ currency: 'NGN' }, 'flutterwave'),
        null
    );
});

test('a foreign-currency plan can be converted to an NGN Flutterwave checkout', async () => {
    const convertedPlan = await checkoutHelpers.resolveCheckoutPlan(
        {
            id: 'plan-gbp-1',
            name: 'Diaspora Single',
            annualPremiumPrice: '25.00',
            currency: 'GBP'
        },
        'NGN',
        {
            async findOne(options) {
                assert.deepEqual(options.where, {
                    currencyCode: 'GBP',
                    isActive: true
                });
                return { rateToNgn: '1808.3184' };
            }
        }
    );

    assert.equal(convertedPlan.annualPremiumPrice, 45207.96);
    assert.equal(convertedPlan.currency, 'NGN');
    assert.equal(convertedPlan.sourceAmount, 25);
    assert.equal(convertedPlan.sourceCurrency, 'GBP');
    assert.equal(checkoutHelpers.validateGatewayForPlan(convertedPlan, 'flutterwave'), null);
});

test('active Flutterwave database integration is discovered from its name and provider config', async () => {
    const integration = {
        name: 'Flutterwave',
        additional_config: { environment: 'production', provider: 'flutterwave' },
        is_active: true,
        is_deleted: false
    };
    const items = await checkoutHelpers.getActiveGatewayIntegrations({
        async findAll(options) {
            assert.deepEqual(options.where, { is_active: true, is_deleted: false });
            return [integration];
        }
    });

    assert.deepEqual(items, [{ integration, provider: 'flutterwave' }]);
});

test('date of birth eligibility uses the plan maximum age on the birthday boundary', () => {
    const now = new Date('2026-08-10T12:00:00.000Z');
    const eligible = checkoutHelpers.validateDateOfBirthForPlan(
        '1966-08-10',
        { ageLimit: 60 },
        now
    );
    const ineligible = checkoutHelpers.validateDateOfBirthForPlan(
        '1965-08-10',
        { ageLimit: 60 },
        now
    );

    assert.equal(eligible.error, undefined);
    assert.equal(eligible.age, 60);
    assert.equal(
        ineligible.error,
        'This plan is only available to enrollees aged 60 or younger'
    );
    assert.match(
        checkoutHelpers.validateDateOfBirthForPlan('2026-02-30', { ageLimit: 60 }, now).error,
        /valid date/
    );
    assert.match(
        checkoutHelpers.validateDateOfBirthForPlan('2026-08-11', { ageLimit: 60 }, now).error,
        /future/
    );
});

test('Flutterwave checkout is created server-side without using the encryption key as a secret', async (t) => {
    const originalPost = axios.post;
    t.after(() => {
        axios.post = originalPost;
    });

    let request;
    axios.post = async (url, body, options) => {
        request = { url, body, options };
        return {
            data: {
                status: 'success',
                data: { link: 'https://checkout.flutterwave.test/hosted' }
            }
        };
    };

    const checkout = await checkoutHelpers.createFlutterwaveCheckout(
        {
            body: {},
            get(header) {
                return header === 'origin' ? 'https://landing.altuhealth.test' : undefined;
            }
        },
        {
            base_url: '',
            secret_key: 'server-secret',
            api_key: 'encryption-key'
        },
        {
            id: 'plan-1',
            name: 'Vital Basic',
            annualPremiumPrice: '100000.00',
            currency: 'NGN'
        },
        {
            firstName: 'Ada',
            lastName: 'Okafor',
            email: 'ada@example.com',
            phoneNumber: '08000000000'
        }
    );

    assert.equal(request.url, 'https://api.flutterwave.com/v3/payments');
    assert.equal(request.options.headers.Authorization, 'Bearer server-secret');
    assert.equal(request.body.amount, 100000);
    assert.equal(request.body.currency, 'NGN');
    assert.equal(request.body.customer.email, 'ada@example.com');
    assert.equal(request.body.meta.paymentAmount, '100000.00');
    assert.equal(request.body.meta.paymentCurrency, 'NGN');
    assert.equal(request.body.meta.sourceAmount, '100000.00');
    assert.equal(request.body.meta.sourceCurrency, 'NGN');
    assert.equal(request.body.payload_hash.length, 64);
    assert.match(request.body.redirect_url, /gateway=flutterwave/);
    assert.equal(checkout.checkoutUrl, 'https://checkout.flutterwave.test/hosted');
    assert.equal(checkout.checkoutReference, request.body.tx_ref);
});

test('Flutterwave verification checks status, reference, amount, and currency', async (t) => {
    const originalGet = axios.get;
    t.after(() => {
        axios.get = originalGet;
    });

    axios.get = async () => ({
        data: {
            status: 'success',
            data: {
                id: 12345,
                tx_ref: 'PAY-EXPECTED',
                status: 'successful',
                amount: 100000,
                currency: 'NGN',
                meta: {
                    planId: 'plan-1',
                    paymentAmount: '100000.00',
                    paymentCurrency: 'NGN'
                },
                customer: { email: 'ada@example.com' }
            }
        }
    });

    const payment = await checkoutHelpers.verifyFlutterwavePayment(
        { secret_key: 'server-secret' },
        '12345',
        {
            checkoutReference: 'PAY-EXPECTED',
            expectedAmount: 100000,
            expectedCurrency: 'NGN',
            expectedPlanId: 'plan-1',
            expectedEmail: 'ada@example.com',
            requireCheckoutAmount: true
        }
    );
    assert.deepEqual(payment, {
        transactionId: '12345',
        transactionReference: 'PAY-EXPECTED',
        amount: 100000,
        currency: 'NGN'
    });

    await assert.rejects(
        checkoutHelpers.verifyFlutterwavePayment(
            { secret_key: 'server-secret' },
            '12345',
            {
                checkoutReference: 'PAY-DIFFERENT',
                expectedAmount: 100000,
                expectedCurrency: 'NGN'
            }
        ),
        /reference does not match/
    );
});
