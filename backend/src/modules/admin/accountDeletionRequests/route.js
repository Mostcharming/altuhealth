'use strict';

const router = require('express').Router();
const controller = require('./controller');

router.get('/', controller.listRequests);
router.get('/:id', controller.getRequest);
router.patch('/:id/approve', controller.approveRequest);
router.patch('/:id/decline', controller.declineRequest);

module.exports = router;
