'use strict';

const express = require('express');
const router = express.Router();
const Appointments = require('./controller');

// CRUD for appointments (provider-specific)
router.get('/list', Appointments.listAppointments);
router.get('/:id', Appointments.getAppointment);

// Status management - update appointment status
router.patch('/:id/status', Appointments.updateAppointmentStatus);

module.exports = router;
