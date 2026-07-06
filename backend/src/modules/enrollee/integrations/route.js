'use strict';

const express = require('express');
const router = express.Router();
const Integrations = require('./controller');

router.get('/heala', Integrations.getHealaConfig);

module.exports = router;
