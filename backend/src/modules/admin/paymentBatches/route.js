'use strict';

const express = require('express');
const router = express.Router();
const PaymentBatches = require('./controller');

// Payment Batch CRUD routes
router.post('/', PaymentBatches.createPaymentBatch);
router.get('/list', PaymentBatches.listPaymentBatches);
router.get('/:id/with-details', PaymentBatches.getPaymentBatchWithDetails);
router.get('/:id', PaymentBatches.getPaymentBatch);
router.put('/:id', PaymentBatches.updatePaymentBatch);
router.delete('/:id', PaymentBatches.deletePaymentBatch);

// Payment Batch Details routes
router.post('/:paymentBatchId/details', PaymentBatches.addBatchDetail);
router.get('/:paymentBatchId/details/list', PaymentBatches.listBatchDetails);
router.get('/:paymentBatchId/details/:detailId', PaymentBatches.getBatchDetail);
router.put('/:paymentBatchId/details/:detailId', PaymentBatches.updateBatchDetail);
router.delete('/:paymentBatchId/details/:detailId', PaymentBatches.deleteBatchDetail);

module.exports = router;
