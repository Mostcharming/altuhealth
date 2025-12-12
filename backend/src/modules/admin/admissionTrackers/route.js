'use strict';

const express = require('express');
const router = express.Router();
const AdmissionTrackers = require('./controller');

// CRUD for admission records
router.post('/', AdmissionTrackers.createAdmissionRecord);
router.get('/list', AdmissionTrackers.listAdmissionRecords);
router.get('/:id', AdmissionTrackers.getAdmissionRecord);
router.put('/:id', AdmissionTrackers.updateAdmissionRecord);
router.delete('/:id', AdmissionTrackers.deleteAdmissionRecord);

// Status management
router.patch('/:id/discharge', AdmissionTrackers.dischargeAdmittedPatient);
router.patch('/:id/transfer', AdmissionTrackers.transferPatient);
router.patch('/:id/mark-expired', AdmissionTrackers.markPatientExpired);
router.patch('/:id/mark-absconded', AdmissionTrackers.markPatientAbsconded);

// Bill approval
router.patch('/:id/approve-bill', AdmissionTrackers.approveBillAmount);

module.exports = router;
