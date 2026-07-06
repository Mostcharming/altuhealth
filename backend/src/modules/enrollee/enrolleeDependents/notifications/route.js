const express = require('express');
const router = express.Router();
const Notifications = require('./controller');

router.get('/list', Notifications.listNotifications);
router.get('/unread-count', Notifications.getUnreadCount);
router.put('/read', Notifications.updateNotificationStatus);

module.exports = router;
