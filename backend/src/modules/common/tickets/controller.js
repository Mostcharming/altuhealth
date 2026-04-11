'use strict';

const { Op } = require('sequelize');
const { addAuditLog } = require('../../../utils/addAdminNotification');

async function createTicket(req, res, next) {
    try {
        const { Ticket } = req.models;
        const userId = req.user?.id;
        const userType = req.user?.type;

        if (!userId || !userType) {
            return res.fail('User authentication required', 401);
        }

        const {
            subject,
            description,
            category,
            priority
        } = req.body || {};

        // Validate required fields
        if (!subject) return res.fail('`subject` is required', 400);

        // Validate userType
        const validUserTypes = ['Enrollee', 'RetailEnrollee', 'Provider', 'Doctor'];
        if (!validUserTypes.includes(userType)) {
            return res.fail(`Invalid user type: ${userType}`, 400);
        }

        // Create the ticket
        const ticket = await Ticket.create({
            userId,
            userType,
            subject,
            description,
            category: category || 'general',
            priority: priority || 'medium',
            status: 'pending'
        });

        await addAuditLog(req.models, {
            action: 'ticket.create',
            message: `Support ticket #${ticket.ticketNumber} created by ${userType} ${userId}`,
            userId,
            userType,
            meta: { ticketId: ticket.id, ticketNumber: ticket.ticketNumber }
        });

        return res.success({ ticket: ticket.toJSON() }, 'Ticket created successfully', 201);
    } catch (err) {
        return next(err);
    }
}

async function getMyTickets(req, res, next) {
    try {
        const { Ticket } = req.models;
        const userId = req.user?.id;
        const userType = req.user?.type;
        const { limit = 10, page = 1, q, status, category } = req.query;

        if (!userId || !userType) {
            return res.fail('User authentication required', 401);
        }

        const isAll = String(limit).toLowerCase() === 'all';
        const limitNum = isAll ? 0 : Number(limit);
        const pageNum = isAll ? 1 : (Number(page) || 1);
        const offset = isAll ? 0 : (pageNum - 1) * limitNum;

        const where = {
            userId,
            userType
        };

        // Search by subject or description
        if (q) {
            where[Op.or] = [
                { subject: { [Op.iLike || Op.like]: `%${q}%` } },
                { description: { [Op.iLike || Op.like]: `%${q}%` } }
            ];
        }

        // Filter by status
        if (status) {
            where.status = status;
        }

        // Filter by category
        if (category) {
            where.category = category;
        }

        const total = await Ticket.count({ where });

        const findOptions = {
            where,
            order: [['createdAt', 'DESC']]
        };

        if (!isAll) {
            findOptions.limit = limitNum;
            findOptions.offset = Number(offset);
        }

        const tickets = await Ticket.findAll(findOptions);
        const data = tickets.map(t => t.toJSON());

        const hasPrevPage = !isAll && pageNum > 1;
        const hasNextPage = !isAll && (offset + tickets.length < total);
        const totalPages = isAll ? 1 : (limitNum > 0 ? Math.ceil(total / limitNum) : 1);

        return res.success({
            list: data,
            count: total,
            page: pageNum,
            limit: isAll ? 'all' : limitNum,
            totalPages,
            hasNextPage,
            hasPrevPage
        });
    } catch (err) {
        return next(err);
    }
}

async function getTicket(req, res, next) {
    try {
        const { Ticket, TicketMessage } = req.models;
        const { id } = req.params;
        const userId = req.user?.id;
        const userType = req.user?.type;

        if (!userId || !userType) {
            return res.fail('User authentication required', 401);
        }

        const ticket = await Ticket.findOne({
            where: { id, userId, userType },
            include: [
                {
                    model: TicketMessage,
                    as: 'messages',
                    where: { isInternal: false }, // Users can only see public messages
                    order: [['createdAt', 'ASC']],
                    required: false
                }
            ]
        });

        if (!ticket) return res.fail('Ticket not found or access denied', 404);

        return res.success({ ticket: ticket.toJSON() });
    } catch (err) {
        return next(err);
    }
}

async function addMessage(req, res, next) {
    try {
        const { TicketMessage, Ticket } = req.models;
        const { ticketId } = req.params;
        const userId = req.user?.id;
        const userType = req.user?.type;

        if (!userId || !userType) {
            return res.fail('User authentication required', 401);
        }

        // Verify user owns the ticket
        const ticket = await Ticket.findOne({
            where: { id: ticketId, userId, userType }
        });

        if (!ticket) return res.fail('Ticket not found or access denied', 404);

        const {
            content,
            attachmentUrl,
            attachmentType,
            attachmentName,
            messageType = 'text'
        } = req.body || {};

        // For text messages, content is required
        if (messageType === 'text' && !content) {
            return res.fail('`content` is required for text messages', 400);
        }

        // For attachment messages, attachmentUrl is required
        if (messageType === 'attachment' && !attachmentUrl) {
            return res.fail('`attachmentUrl` is required for attachment messages', 400);
        }

        // Create the message (users cannot create internal messages)
        const message = await TicketMessage.create({
            ticketId,
            senderId: userId,
            senderType: userType,
            messageType,
            content,
            attachmentUrl,
            attachmentType,
            attachmentName,
            isInternal: false
        });

        // Update ticket status if it's still pending
        if (ticket.status === 'pending') {
            await ticket.update({ status: 'in_progress' });
        }

        await addAuditLog(req.models, {
            action: 'ticket.message.add',
            message: `Message added to support ticket #${ticket.ticketNumber}`,
            userId,
            userType,
            meta: { ticketId, messageId: message.id, ticketNumber: ticket.ticketNumber }
        });

        return res.success({ message: message.toJSON() }, 'Message added successfully', 201);
    } catch (err) {
        return next(err);
    }
}

async function getMessages(req, res, next) {
    try {
        const { TicketMessage, Ticket } = req.models;
        const { ticketId } = req.params;
        const userId = req.user?.id;
        const userType = req.user?.type;
        const { limit = 20, page = 1 } = req.query;

        if (!userId || !userType) {
            return res.fail('User authentication required', 401);
        }

        // Verify user owns the ticket
        const ticket = await Ticket.findOne({
            where: { id: ticketId, userId, userType }
        });

        if (!ticket) return res.fail('Ticket not found or access denied', 404);

        const limitNum = Number(limit);
        const pageNum = Number(page) || 1;
        const offset = (pageNum - 1) * limitNum;

        const total = await TicketMessage.count({
            where: { ticketId, isInternal: false }
        });

        const messages = await TicketMessage.findAll({
            where: { ticketId, isInternal: false },
            order: [['createdAt', 'ASC']],
            limit: limitNum,
            offset
        });

        const data = messages.map(m => m.toJSON());

        const hasNextPage = offset + messages.length < total;
        const hasPrevPage = pageNum > 1;
        const totalPages = Math.ceil(total / limitNum);

        return res.success({
            list: data,
            count: total,
            page: pageNum,
            limit: limitNum,
            totalPages,
            hasNextPage,
            hasPrevPage
        });
    } catch (err) {
        return next(err);
    }
}

module.exports = {
    createTicket,
    getMyTickets,
    getTicket,
    addMessage,
    getMessages
};
