'use strict';

const router = require('express').Router();

router.use('/plans', require('./plans/route'));

module.exports = router;
