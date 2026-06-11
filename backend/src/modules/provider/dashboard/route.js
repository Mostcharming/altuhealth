'use strict';

const express = require('express');
const router = express.Router();
const Dashboard = require('./controller');

router.get('/overview', Dashboard.getOverview);

module.exports = router;
