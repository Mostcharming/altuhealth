'use strict';

const express = require('express');
const router = express.Router();
const CompanyPlans = require('./controller');

// CRUD for company plans
router.post('/', CompanyPlans.createCompanyPlan);
router.get('/list', CompanyPlans.listCompanyPlans);
router.get('/:id', CompanyPlans.getCompanyPlan);
router.put('/:id', CompanyPlans.updateCompanyPlan);
router.delete('/:id', CompanyPlans.deleteCompanyPlan);

// Benefit categories
router.post('/benefit-categories/add', CompanyPlans.addBenefitCategory);
router.delete('/benefit-categories/:companyPlanId/:benefitCategoryId', CompanyPlans.removeBenefitCategory);

// Individual benefits
router.post('/benefits/add', CompanyPlans.addBenefit);
router.delete('/benefits/:companyPlanId/:benefitId', CompanyPlans.removeBenefit);

// Exclusions
router.post('/exclusions/add', CompanyPlans.addExclusion);
router.delete('/exclusions/:companyPlanId/:exclusionId', CompanyPlans.removeExclusion);

// Providers
router.post('/providers/add', CompanyPlans.addProvider);
router.delete('/providers/:companyPlanId/:providerId', CompanyPlans.removeProvider);

module.exports = router;
