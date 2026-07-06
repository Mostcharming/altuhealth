'use strict';

const express = require('express');
const router = express.Router();
const Claims = require('./controller');

router.get('/authorization-codes', Claims.searchApprovedAuthorizationCodes);
router.post('/', Claims.createClaimFromAuthorization);
router.get('/list', Claims.listClaims);
router.get('/:id', Claims.getClaimById);
router.post('/:id/submit', Claims.submitClaim);

module.exports = router;
