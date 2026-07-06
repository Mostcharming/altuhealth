'use strict';

const express = require('express');
const router = express.Router();
const CompanySubsidiaries = require('./controller');

// CRUD for company subsidiaries
router.post('/', CompanySubsidiaries.createSubsidiary);
router.get('/list', CompanySubsidiaries.listSubsidiaries);
router.delete('/company/:companyId', CompanySubsidiaries.deleteAllSubsidiariesByCompany);
router.get('/:id', CompanySubsidiaries.getSubsidiary);
router.put('/:id', CompanySubsidiaries.updateSubsidiary);
router.delete('/:id', CompanySubsidiaries.deleteSubsidiary);

module.exports = router;
