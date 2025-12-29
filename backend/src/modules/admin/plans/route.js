'use strict';

const express = require('express');
const router = express.Router();
const Plans = require('./controller');

// CRUD for plans
router.post('/', Plans.createPlan);
router.get('/list', Plans.listPlans);
router.get('/:id', Plans.getPlan);
router.put('/:id', Plans.updatePlan);
router.delete('/:id', Plans.deletePlan);

// Benefit categories
router.post('/benefit-categories/add', Plans.addBenefitCategory);
router.delete('/benefit-categories/:planId/:benefitCategoryId', Plans.removeBenefitCategory);

// Exclusions
router.post('/exclusions/add', Plans.addExclusion);
router.delete('/exclusions/:planId/:exclusionId', Plans.removeExclusion);

// Providers
router.post('/providers/add', Plans.addProvider);
router.delete('/providers/:planId/:providerId', Plans.removeProvider);

module.exports = router;
