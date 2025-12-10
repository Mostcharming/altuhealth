'use strict';

const express = require('express');
const router = express.Router();
const PaymentBatches = require('./controller');
const ClaimInfo = require('./claimInfoController');
const Conflict = require('./conflictController');

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

// Claim Info routes
router.get('/details/:paymentBatchDetailId/claims', ClaimInfo.getClaimsByPaymentBatchDetail);
router.post('/claims', ClaimInfo.createClaim);
router.get('/claims/:claimId', ClaimInfo.getClaimDetail);
router.put('/claims/:claimId', ClaimInfo.updateClaim);
router.delete('/claims/:claimId', ClaimInfo.deleteClaim);

// Conflict routes
router.get('/details/:paymentBatchDetailId/conflicts', Conflict.getConflictsByPaymentBatchDetail);
router.post('/conflicts', Conflict.createConflict);
router.get('/conflicts/:conflictId', Conflict.getConflictDetail);
router.put('/conflicts/:conflictId', Conflict.updateConflict);
router.put('/conflicts/:conflictId/resolve', Conflict.resolveConflict);
router.delete('/conflicts/:conflictId', Conflict.deleteConflict);

module.exports = router;
