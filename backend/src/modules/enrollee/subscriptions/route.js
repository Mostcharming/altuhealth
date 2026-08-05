'use strict';

const express = require('express');
const Subscriptions = require('./controller');

const router = express.Router();

router.get('/', Subscriptions.getSubscriptionOverview);
router.get('/gateways', Subscriptions.listGateways);
router.post('/checkout', Subscriptions.createCheckout);
router.post('/complete', Subscriptions.completeCheckout);

module.exports = router;
