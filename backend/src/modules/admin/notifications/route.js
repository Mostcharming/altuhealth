const express = require('express');
const router = express.Router();
const { responseFormatter, errorHandler } = require('../../../middlewares/common/responseFormatter');
const Notifications = require('./controller');

router.use(responseFormatter);


router.get('/list', Notifications.listNotifications);
router.put('/read', Notifications.updateNotificationStatus);

router.use(errorHandler);

module.exports = router;