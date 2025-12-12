'use strict';

const express = require('express');
const router = express.Router();
const Appointments = require('./controller');

// CRUD for appointments
router.post('/', Appointments.createAppointment);
router.get('/list', Appointments.listAppointments);
router.get('/:id', Appointments.getAppointment);
router.put('/:id', Appointments.updateAppointment);
router.delete('/:id', Appointments.deleteAppointment);

// Status management
router.patch('/:id/approve', Appointments.approveAppointment);
router.patch('/:id/reject', Appointments.rejectAppointment);
router.patch('/:id/attended', Appointments.markAppointmentAttended);
router.patch('/:id/missed', Appointments.markAppointmentMissed);
router.patch('/:id/cancel', Appointments.cancelAppointment);
router.patch('/:id/reschedule', Appointments.rescheduleAppointment);

module.exports = router;
