const express = require('express');
const { getEnrolleeBenefits, getEnrolleeBenefitById } = require('./controller');

const router = express.Router();

// Get all benefits for the authenticated enrollee
router.get('/list', getEnrolleeBenefits);

// Get a specific benefit by ID
router.get('/:benefitId', getEnrolleeBenefitById);

module.exports = router;
