const express = require('express');
const router = express.Router();
const Diagnosis = require('./controller');

// CRUD for diagnoses
router.post('/', Diagnosis.createDiagnosis);
router.get('/list', Diagnosis.listDiagnoses);
router.get('/severity-options', Diagnosis.getSeverityOptions);
router.get('/:id', Diagnosis.getDiagnosis);
router.put('/:id', Diagnosis.updateDiagnosis);
router.delete('/:id', Diagnosis.deleteDiagnosis);

module.exports = router;
