const router = require('express').Router();
const { getMetrics } = require('./controller');

router.get('/metrics', getMetrics);

module.exports = router;
