'use strict';

const router = require('express').Router();

router.use('/plans', require('./plans/route'));
router.use('/purchases', require('./purchases/route'));

module.exports = router;
