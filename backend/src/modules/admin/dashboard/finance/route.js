const router = require('express').Router();

router.get('/finance', require('./controller').getMetrics);

module.exports = router;
