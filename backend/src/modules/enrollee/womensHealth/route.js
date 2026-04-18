'use strict';

const express = require('express');
const router = express.Router();
const WomensHealth = require('./controller');

// Period tracker routes
router.get('/tracker', WomensHealth.getPeriodTracker);
router.post('/tracker', WomensHealth.createPeriodTracker);
router.put('/tracker', WomensHealth.updatePeriodTracker);

// Period events for calendar
router.get('/events', WomensHealth.getPeriodEvents);

module.exports = router;
