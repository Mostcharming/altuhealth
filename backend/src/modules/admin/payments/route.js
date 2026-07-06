'use strict';

const express = require('express');
const router = express.Router();
const Payments = require('./controller');

// CRUD for payments
router.post('/', Payments.createPayment);
router.get('/list', Payments.listPayments);
router.get('/:id', Payments.getPayment);
router.put('/:id', Payments.updatePayment);
router.delete('/:id', Payments.deletePayment);

// Payment actions
router.patch('/:id/verify', Payments.verifyPayment);
router.patch('/:id/refund', Payments.refundPayment);

module.exports = router;
