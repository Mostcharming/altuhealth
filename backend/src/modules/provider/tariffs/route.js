'use strict';

const express = require('express');
const router = express.Router();
const Tariffs = require('./controller');

router.get('/drugs/list', Tariffs.listDrugs);
router.get('/services/list', Tariffs.listServices);

module.exports = router;
