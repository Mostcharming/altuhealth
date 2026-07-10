'use strict';

const express = require('express');
const router = express.Router();
const Providers = require('./controller');

router.get('/', Providers.listPublicProviders);

module.exports = router;
