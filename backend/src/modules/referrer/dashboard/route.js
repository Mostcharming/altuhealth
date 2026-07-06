const express = require('express');
const router = express.Router();

const { getDashboard } = require('./controller');

router.get('/', getDashboard);
router.get('/referrals', getDashboard);
router.get('/earnings', getDashboard);

module.exports = router;
