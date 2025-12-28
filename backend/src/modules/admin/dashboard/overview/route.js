const router = require('express').Router();

router.get('/overview', require('./controller').getMetrics);

module.exports = router;
