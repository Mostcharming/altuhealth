'use strict';

const express = require('express');
const router = express.Router();
const NotificationTemplates = require('./controller');

// List all notification templates with search (name and subject only)
router.get('/list', NotificationTemplates.listNotificationTemplates);

// Get single notification template details by ID (all fields)
router.get('/:id', NotificationTemplates.getNotificationTemplateById);

// Create new notification template
router.post('/', NotificationTemplates.createNotificationTemplate);

// Update notification template
router.put('/:id', NotificationTemplates.updateNotificationTemplate);

// Delete notification template
router.delete('/:id', NotificationTemplates.deleteNotificationTemplate);

module.exports = router;
