'use strict';

const express = require('express');
const router = express.Router();
const Companies = require('./controller');

// CRUD for companies
router.post('/', Companies.createCompany);
router.get('/list', Companies.listCompanies);
router.get('/:id', Companies.getCompany);
router.put('/:id', Companies.updateCompany);
router.delete('/:id', Companies.deleteCompany);

module.exports = router;
