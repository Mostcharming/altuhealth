'use strict';

const express = require('express');
const router = express.Router();
const Appointments = require('./controller');

// CRUD for appointments (enrollee-specific)
router.post('/', Appointments.createAppointment);
router.get('/list', Appointments.listAppointments);
router.get('/:id', Appointments.getAppointment);
router.put('/:id', Appointments.updateAppointment);

// Status management
router.patch('/:id/cancel', Appointments.cancelAppointment);

module.exports = router;
