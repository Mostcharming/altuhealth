'use strict';

const express = require('express');
const router = express.Router();
const Referrers = require('./controller');

// CRUD for referrers
router.post('/', Referrers.createReferrer);
router.get('/list', Referrers.listReferrers);
router.get('/:id/details', Referrers.getSingleReferrerDetails);
router.get('/:id', Referrers.getReferrer);
router.put('/:id', Referrers.updateReferrer);
router.delete('/:id', Referrers.deleteReferrer);

// Referrer statistics and earnings
router.get('/:id/earnings', Referrers.getReferrerEarnings);
router.get('/:id/referrals', Referrers.getReferrerReferrals);

// Withdraw request
router.post('/:id/withdraw-request', Referrers.createWithdrawRequest);

module.exports = router;
