'use strict';

const express = require('express');
const router = express.Router();
const Approvals = require('./controller');
const { securityMiddleware } = require('../../../middlewares/common/security');

// all routes require admin security
router.use(securityMiddleware);

// list approvals
router.get('/list', Approvals.listApprovals);
// get single approval
router.get('/:id', Approvals.getApproval);
// perform action (approve/decline)
router.post('/:id/action', Approvals.performAction);

module.exports = router;
