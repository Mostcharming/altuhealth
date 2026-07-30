'use strict';

const express = require('express');
const router = express.Router();
const CorporateRequests = require('./controller');

router.post('/', CorporateRequests.submitCorporateRequest);

module.exports = router;
