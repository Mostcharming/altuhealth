'use strict';

const express = require('express');
const router = express.Router();
const Plans = require('./controller');

router.get('/', Plans.listPublicPlans);

module.exports = router;
