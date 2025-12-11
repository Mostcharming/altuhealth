'use strict';

const express = require('express');
const router = express.Router();
const PaymentAdvicesController = require('./controller');

// Payment Advice CRUD routes
router.post('/', PaymentAdvicesController.createPaymentAdvice);
router.get('/list', PaymentAdvicesController.listPaymentAdvices);
router.get('/:id', PaymentAdvicesController.getPaymentAdvice);
router.put('/:id', PaymentAdvicesController.updatePaymentAdvice);
router.delete('/:id', PaymentAdvicesController.deletePaymentAdvice);

// Payment Advice workflow routes
router.put('/:id/approve', PaymentAdvicesController.approvePaymentAdvice);
router.put('/:id/send', PaymentAdvicesController.sendPaymentAdvice);
router.put('/:id/acknowledge', PaymentAdvicesController.acknowledgePaymentAdvice);

// Payment Advice by batch
router.get('/batch/:paymentBatchId', PaymentAdvicesController.getPaymentAdvicesByBatch);

module.exports = router;
