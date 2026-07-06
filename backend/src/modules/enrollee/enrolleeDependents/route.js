'use strict';

const express = require('express');
const router = express.Router();
const Dependents = require('./controller');
const { listDependentMedicalHistory, createDependentMedicalHistory } = require('./medicalHistoryController');
const uploadProfileImage = require('../../../middlewares/common/uploadProfileImage');

// List route (must come before :id routes)
router.get('/list', Dependents.listDependents);

// CRUD for dependents (enrollee-specific)
router.post('/', uploadProfileImage('picture'), Dependents.createDependent);
router.get('/:id', Dependents.getDependent);
router.put('/:id', Dependents.updateDependent);
router.delete('/:id', Dependents.deleteDependent);

// Medical History routes for dependents (must come after /:id route)
router.get('/:dependentId/medical-histories', listDependentMedicalHistory);
router.post('/:dependentId/medical-histories', createDependentMedicalHistory);

module.exports = router;
