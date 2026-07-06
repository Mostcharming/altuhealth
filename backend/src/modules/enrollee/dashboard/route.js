const { Router } = require('express');
const { getDashboardData } = require('./controller');

const router = Router();

/**
 * GET /enrollee/dashboard
 * Get dashboard data for the current enrollee
 */
router.get('/', getDashboardData);

module.exports = router;
