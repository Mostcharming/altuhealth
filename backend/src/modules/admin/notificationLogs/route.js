'use strict';

const express = require('express');
const router = express.Router();
const NotificationLogs = require('./controller');

router.get('/list', NotificationLogs.listNotificationLogs);
router.get('/:id', NotificationLogs.getNotificationLog);

module.exports = router;
