'use strict';

const express = require('express');
const router = express.Router();
const UtilizationReports = require('./controller');

router.get('/company', UtilizationReports.getCompanyReport);
router.get('/provider', UtilizationReports.getProviderReport);
router.get('/retail', UtilizationReports.getRetailReport);

module.exports = router;
