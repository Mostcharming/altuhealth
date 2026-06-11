'use strict';

const express = require('express');
const router = express.Router();
const PaymentAdvices = require('./controller');

router.get('/list', PaymentAdvices.listPaymentAdvices);
router.get('/:id', PaymentAdvices.getPaymentAdvice);

module.exports = router;
