const express = require('express');
const router = express.Router();
const Notifications = require('./controller');



router.get('/list', Notifications.listNotifications);
router.put('/read', Notifications.updateNotificationStatus);


module.exports = router;