'use strict';

const express = require('express');
const router = express.Router();
const AuthorizationCodes = require('./controller');

router.post('/', AuthorizationCodes.createAuthorizationCode);

module.exports = router;
