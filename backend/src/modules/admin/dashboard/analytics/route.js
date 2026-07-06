const router = require('express').Router();

router.get('/analytics', require('./controller').getMetrics);

module.exports = router;
