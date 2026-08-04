'use strict';

const express = require('express');
const router = express.Router();
const Plans = require('./controller');

router.get('/', Plans.listPublicPlans);
router.get('/:id/benefits', Plans.getPublicPlanBenefits);

module.exports = router;
