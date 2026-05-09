'use strict';

const express = require('express');
const router = express.Router();
const UtilizationReviewsController = require('./controller');

// CRUD for utilization reviews
router.post('/', UtilizationReviewsController.createUtilizationReview);
router.get('/list', UtilizationReviewsController.listUtilizationReviews);
router.get('/:id', UtilizationReviewsController.getUtilizationReview);
router.put('/:id', UtilizationReviewsController.updateUtilizationReview);
router.post('/:id/submit', UtilizationReviewsController.submitUtilizationReview);
router.post('/:id/approve', UtilizationReviewsController.approveUtilizationReview);
router.delete('/:id', UtilizationReviewsController.deleteUtilizationReview);

module.exports = router;
