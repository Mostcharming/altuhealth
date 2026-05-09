'use strict';

const express = require('express');
const router = express.Router();
const ProviderSpecializations = require('./controller');

// CRUD for provider specializations
router.post('/', ProviderSpecializations.createProviderSpecialization);
router.get('/list', ProviderSpecializations.listProviderSpecializations);
router.get('/:id', ProviderSpecializations.getProviderSpecialization);
router.put('/:id', ProviderSpecializations.updateProviderSpecialization);
router.delete('/:id', ProviderSpecializations.deleteProviderSpecialization);

module.exports = router;
