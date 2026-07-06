'use strict';

const express = require('express');
const router = express.Router();
const Purchases = require('./controller');

router.get('/gateways', Purchases.listGateways);
router.post('/checkout', Purchases.createCheckout);
router.post('/complete', Purchases.completePurchase);

module.exports = router;
