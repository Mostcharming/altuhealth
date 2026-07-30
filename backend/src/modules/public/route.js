'use strict';

const router = require('express').Router();

router.use('/plans', require('./plans/route'));
router.use('/purchases', require('./purchases/route'));
router.use('/providers', require('./providers/route'));
router.use('/corporate-requests', require('./corporateRequests/route'));

module.exports = router;
