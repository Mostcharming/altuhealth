'use strict';

const express = require('express');
const router = express.Router();
const ClaimsController = require('./controller');

// CRUD for claims
router.post('/', ClaimsController.createClaim);
router.post('/with-details', ClaimsController.createClaimWithDetails);
router.get('/list', ClaimsController.listClaims);

// Claim details routes (must come before /:id routes to avoid conflicts)
router.get('/:claimId/details/list', ClaimsController.listClaimDetails);
router.get('/:claimId/details/:detailId', ClaimsController.getClaimDetailById);
router.post('/:claimId/details', ClaimsController.createClaimDetail);
router.put('/:claimId/details/:detailId', ClaimsController.updateClaimDetail);
router.delete('/:claimId/details/:detailId', ClaimsController.deleteClaimDetail);

router.get('/:id', ClaimsController.getClaimById);
router.put('/:id', ClaimsController.updateClaim);
router.delete('/:id', ClaimsController.deleteClaim);

// Filter and search claims
router.get('/filter/by-provider/:providerId', ClaimsController.getClaimsByProvider);
router.get('/filter/by-status/:status', ClaimsController.getClaimsByStatus);
router.get('/filter/by-period', ClaimsController.getClaimsByPeriod);
router.get('/filter/by-submitter/:submittedById', ClaimsController.getClaimsBySubmitter);

// Claim management operations
router.post('/:id/submit', ClaimsController.submitClaim);
router.post('/:id/vet', ClaimsController.vetClaim);
router.post('/:id/approve', ClaimsController.approveClaim);
router.post('/:id/reject', ClaimsController.rejectClaim);
router.post('/:id/query', ClaimsController.queryClaim);
router.post('/:id/mark-paid', ClaimsController.markClaimAsPaid);
router.post('/:id/mark-partially-paid', ClaimsController.markClaimAsPartiallyPaid);

// Claim statistics and analytics
router.get('/analytics/summary', ClaimsController.getClaimsSummary);
router.get('/analytics/by-status', ClaimsController.getClaimsByStatusCount);
router.get('/analytics/by-provider', ClaimsController.getClaimsByProviderCount);
router.get('/analytics/payment-stats', ClaimsController.getPaymentStatistics);

module.exports = router;
