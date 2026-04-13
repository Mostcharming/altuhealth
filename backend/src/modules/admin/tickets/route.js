'use strict';

const express = require('express');
const router = express.Router();
const Tickets = require('./controller');
const uploadTicketAttachment = require('../../../middlewares/common/uploadTicketAttachment');

// ==================== TICKET ROUTES ====================

// Create a new ticket
router.post('/', Tickets.createTicket);

// Get ticket statistics
router.get('/stats', Tickets.getTicketStats);

// List all tickets with filtering and search
router.get('/list', Tickets.listTickets);

// Get a single ticket by ID (with optional messages)
router.get('/:id', Tickets.getTicket);

// Update ticket (status, priority, category, assignment)
router.put('/:id', Tickets.updateTicket);

// Assign ticket to an admin
router.patch('/:id/assign', Tickets.assignTicket);

// Close a ticket
router.patch('/:id/close', Tickets.closeTicket);

// Delete a ticket
router.delete('/:id', Tickets.deleteTicket);

// ==================== TICKET MESSAGE ROUTES ====================

// Add a message to a ticket (with optional image attachment)
router.post('/:ticketId/messages', uploadTicketAttachment('attachment'), Tickets.addMessage);

// Get messages for a ticket
router.get('/:ticketId/messages', Tickets.getTicketMessages);

// Delete a specific message from a ticket
router.delete('/:ticketId/messages/:messageId', Tickets.deleteMessage);

module.exports = router;
