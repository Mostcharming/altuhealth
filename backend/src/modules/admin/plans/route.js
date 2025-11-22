'use strict';

const express = require('express');
const router = express.Router();
const Plans = require('./controller');

// CRUD for plans
router.post('/', Plans.createPlan);
router.get('/list', Plans.listPlans);
router.get('/:id', Plans.getPlan);
router.put('/:id', Plans.updatePlan);
router.delete('/:id', Plans.deletePlan);

module.exports = router;
