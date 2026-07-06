'use strict';

const express = require('express');
const router = express.Router();
const AuthorizationCodes = require('./controller');

router.post('/', AuthorizationCodes.createAuthorizationCode);
router.get('/:id', AuthorizationCodes.getAuthorizationCode);

module.exports = router;
