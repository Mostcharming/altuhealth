'use strict';

const express = require('express');
const router = express.Router();
const MedicalRecords = require('./controller');

router.get('/', MedicalRecords.listMedicalRecords);
router.get('/:id', MedicalRecords.getMedicalRecord);

module.exports = router;
