'use strict';

const express = require('express');
const router = express.Router();
const Providers = require('./controller');

// CRUD for providers
router.post('/', Providers.createProvider);
router.get('/list', Providers.listProviders);
router.get('/:id', Providers.getProvider);
router.put('/:id', Providers.updateProvider);
router.delete('/:id', Providers.deleteProvider);

// Plan management for providers
// router.post('/:id/plans', Providers.addPlanToProvider);
router.post('/:id/plans', Providers.updateProviderPlans);
router.delete('/:id/plans', Providers.removePlanFromProvider);

// Resend login details to provider
router.post('/:id/resend-login-details', Providers.resendProviderLoginDetails);

module.exports = router;
