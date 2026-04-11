'use strict';

const express = require('express');
const router = express.Router();
const Tickets = require('./controller');

// Create a new ticket
router.post('/', Tickets.createTicket);

// Get all tickets of the authenticated user
router.get('/', Tickets.getMyTickets);

// Get a single ticket by ID with messages
router.get('/:id', Tickets.getTicket);

// Add a message to a ticket
router.post('/:ticketId/messages', Tickets.addMessage);

// Get messages for a ticket
router.get('/:ticketId/messages', Tickets.getMessages);

module.exports = router;
