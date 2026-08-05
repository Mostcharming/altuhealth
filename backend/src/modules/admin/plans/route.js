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
router.put('/:id/benefit-categories', Plans.syncBenefitCategories);
router.post('/benefit-categories/add', Plans.addBenefitCategory);
router.delete('/benefit-categories/:planId/:benefitCategoryId', Plans.removeBenefitCategory);

// Individual benefits
router.put('/:planId/benefit-categories/:benefitCategoryId/benefits', Plans.syncBenefits);
router.post('/benefits/add', Plans.addBenefit);
router.delete('/benefits/:planId/:benefitId', Plans.removeBenefit);

// Exclusions
router.post('/exclusions/add', Plans.addExclusion);
router.delete('/exclusions/:planId/:exclusionId', Plans.removeExclusion);

// Providers
router.post('/providers/add', Plans.addProvider);
router.delete('/providers/:planId/:providerId', Plans.removeProvider);

module.exports = router;
