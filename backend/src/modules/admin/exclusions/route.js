'use strict';

const express = require('express');
const router = express.Router();
const Exclusions = require('./controller');

// CRUD for exclusions
router.post('/', Exclusions.createExclusion);
router.get('/list', Exclusions.listExclusions);
router.get('/:id', Exclusions.getExclusion);
router.put('/:id', Exclusions.updateExclusion);
router.delete('/:id', Exclusions.deleteExclusion);

module.exports = router;
