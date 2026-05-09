'use strict';

const express = require('express');
const router = express.Router();
const MedicalHistory = require('./controller');

// Medical history routes (enrollee-specific, read-only)
router.get('/list', MedicalHistory.listMedicalHistory);
router.get('/:id', MedicalHistory.getMedicalHistory);

module.exports = router;
