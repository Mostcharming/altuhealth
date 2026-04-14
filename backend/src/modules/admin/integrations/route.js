'use strict';

const express = require('express');
const router = express.Router();
const IntegrationController = require('./controller');

// CRUD for integrations
router.post('/', IntegrationController.createIntegration);
router.get('/list', IntegrationController.listIntegrations);
router.get('/:id', IntegrationController.getIntegration);
router.put('/:id', IntegrationController.updateIntegration);
router.delete('/:id', IntegrationController.deleteIntegration);
router.patch('/:id/toggle-status', IntegrationController.toggleIntegrationStatus);

module.exports = router;
