'use strict';

const express = require('express');
const router = express.Router();
const Conversations = require('./controller');

// Conversation CRUD
router.post('/', Conversations.createConversation);
router.get('/list', Conversations.listConversations);
router.get('/:id', Conversations.getConversation);
router.put('/:id', Conversations.updateConversation);
router.delete('/:id', Conversations.deleteConversation);

// Conversation Messages
router.post('/:id/messages', Conversations.addMessage);
router.get('/:id/messages', Conversations.listMessages);
router.put('/:id/messages/:messageId', Conversations.updateMessage);
router.delete('/:id/messages/:messageId', Conversations.deleteMessage);
router.patch('/:id/messages/:messageId/read', Conversations.markMessageAsRead);

// Conversation Actions
router.patch('/:id/status', Conversations.updateConversationStatus);
router.patch('/:id/assign', Conversations.assignConversation);
router.patch('/:id/archive', Conversations.archiveConversation);
router.patch('/:id/unarchive', Conversations.unarchiveConversation);

module.exports = router;
