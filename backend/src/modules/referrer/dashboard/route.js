const express = require('express');
const router = express.Router();

const { getDashboard, updateBankDetails } = require('./controller');

router.get('/', getDashboard);
router.get('/referrals', getDashboard);
router.get('/earnings', getDashboard);
router.put('/bank-details', updateBankDetails);

module.exports = router;
