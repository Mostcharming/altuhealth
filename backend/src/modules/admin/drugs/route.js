'use strict';

const express = require('express');
const router = express.Router();
const Drugs = require('./controller');

// CRUD for drugs
router.post('/', Drugs.createDrug);
router.get('/list', Drugs.listDrugs);
router.get('/:id', Drugs.getDrug);
router.put('/:id', Drugs.updateDrug);
router.delete('/:id', Drugs.deleteDrug);

module.exports = router;
