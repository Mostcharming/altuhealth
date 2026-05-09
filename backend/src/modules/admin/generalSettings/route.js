'use strict';

const express = require('express');
const router = express.Router();
const GeneralSettings = require('./controller');

// Get general settings
router.get('/', GeneralSettings.getGeneralSettings);

// Update general settings
router.put('/', GeneralSettings.updateGeneralSettings);

module.exports = router;
