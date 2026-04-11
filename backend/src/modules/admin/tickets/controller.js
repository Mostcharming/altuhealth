'use strict';

const { Op } = require('sequelize');
const { addAuditLog } = require('../../../utils/addAdminNotification');

async function createTicket(req, res, next) {
    try {
        const { Ticket } = req.models;
        const {
            userId,
            userType,
            subject,
            description,
            category,
            priority
        } = req.body || {};

        // Validate required fields
        if (!userId) return res.fail('`userId` is required', 400);
        if (!userType) return res.fail('`userType` is required', 400);
        if (!subject) return res.fail('`subject` is required', 400);

        // Validate userType
        const validUserTypes = ['Enrollee', 'RetailEnrollee', 'Provider', 'Doctor'];
        if (!validUserTypes.includes(userType)) {
            return res.fail(`\`userType\` must be one of: ${validUserTypes.join(', ')}`, 400);
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
            userId: (req.user && req.user.id) ? req.user.id : null,
            userType: (req.user && req.user.type) ? req.user.type : null,
            meta: { ticketId: ticket.id, ticketNumber: ticket.ticketNumber }
        });

        return res.success({ ticket: ticket.toJSON() }, 'Ticket created successfully', 201);
    } catch (err) {
        return next(err);
    }
}

async function getTicket(req, res, next) {
    try {
        const { Ticket, TicketMessage } = req.models;
        const { id } = req.params;
        const { includeMessages } = req.query;

        const findOptions = {
            where: { id }
        };

        if (includeMessages === 'true') {
            findOptions.include = [
                {
                    model: TicketMessage,
                    as: 'messages',
                    order: [['createdAt', 'ASC']]
                }
            ];
        }

        const ticket = await Ticket.findByPk(id, findOptions);
        if (!ticket) return res.fail('Ticket not found', 404);

        return res.success({ ticket: ticket.toJSON() });
    } catch (err) {
        return next(err);
    }
}

async function listTickets(req, res, next) {
    try {
        const { Ticket } = req.models;
        const { limit = 10, page = 1, q, status, category, priority, userType, assignedToId } = req.query;

        const isAll = String(limit).toLowerCase() === 'all';
        const limitNum = isAll ? 0 : Number(limit);
        const pageNum = isAll ? 1 : (Number(page) || 1);
        const offset = isAll ? 0 : (pageNum - 1) * limitNum;

        const where = {};

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

        // Filter by priority
        if (priority) {
            where.priority = priority;
        }

        // Filter by userType
        if (userType) {
            where.userType = userType;
        }

        // Filter by assignedToId (for admin filtering tickets assigned to them)
        if (assignedToId) {
            where.assignedToId = assignedToId;
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

async function updateTicket(req, res, next) {
    try {
        const { Ticket } = req.models;
        const { id } = req.params;
        const { status, priority, category, assignedToId } = req.body || {};

        const ticket = await Ticket.findByPk(id);
        if (!ticket) return res.fail('Ticket not found', 404);

        const updates = {};
        if (status !== undefined) updates.status = status;
        if (priority !== undefined) updates.priority = priority;
        if (category !== undefined) updates.category = category;
        if (assignedToId !== undefined) updates.assignedToId = assignedToId;

        // If closing ticket, set closedAt
        if (status === 'closed' && !ticket.closedAt) {
            updates.closedAt = new Date();
        }

        await ticket.update(updates);

        await addAuditLog(req.models, {
            action: 'ticket.update',
            message: `Support ticket #${ticket.ticketNumber} updated`,
            userId: (req.user && req.user.id) ? req.user.id : null,
            userType: (req.user && req.user.type) ? req.user.type : null,
            meta: { ticketId: ticket.id, ticketNumber: ticket.ticketNumber, updates }
        });

        return res.success({ ticket: ticket.toJSON() }, 'Ticket updated successfully');
    } catch (err) {
        return next(err);
    }
}

async function assignTicket(req, res, next) {
    try {
        const { Ticket } = req.models;
        const { id } = req.params;
        const { assignedToId } = req.body || {};

        if (!assignedToId) return res.fail('`assignedToId` is required', 400);

        const ticket = await Ticket.findByPk(id);
        if (!ticket) return res.fail('Ticket not found', 404);

        await ticket.update({ assignedToId, status: 'in_progress' });

        await addAuditLog(req.models, {
            action: 'ticket.assign',
            message: `Support ticket #${ticket.ticketNumber} assigned to admin ${assignedToId}`,
            userId: (req.user && req.user.id) ? req.user.id : null,
            userType: (req.user && req.user.type) ? req.user.type : null,
            meta: { ticketId: ticket.id, ticketNumber: ticket.ticketNumber, assignedToId }
        });

        return res.success({ ticket: ticket.toJSON() }, 'Ticket assigned successfully');
    } catch (err) {
        return next(err);
    }
}

async function closeTicket(req, res, next) {
    try {
        const { Ticket } = req.models;
        const { id } = req.params;

        const ticket = await Ticket.findByPk(id);
        if (!ticket) return res.fail('Ticket not found', 404);

        await ticket.update({
            status: 'closed',
            closedAt: new Date()
        });

        await addAuditLog(req.models, {
            action: 'ticket.close',
            message: `Support ticket #${ticket.ticketNumber} closed`,
            userId: (req.user && req.user.id) ? req.user.id : null,
            userType: (req.user && req.user.type) ? req.user.type : null,
            meta: { ticketId: ticket.id, ticketNumber: ticket.ticketNumber }
        });

        return res.success({ ticket: ticket.toJSON() }, 'Ticket closed successfully');
    } catch (err) {
        return next(err);
    }
}

async function deleteTicket(req, res, next) {
    try {
        const { Ticket } = req.models;
        const { id } = req.params;

        const ticket = await Ticket.findByPk(id);
        if (!ticket) return res.fail('Ticket not found', 404);

        const ticketNumber = ticket.ticketNumber;
        await ticket.destroy();

        await addAuditLog(req.models, {
            action: 'ticket.delete',
            message: `Support ticket #${ticketNumber} deleted`,
            userId: (req.user && req.user.id) ? req.user.id : null,
            userType: (req.user && req.user.type) ? req.user.type : null,
            meta: { ticketId: id, ticketNumber }
        });

        return res.success(null, 'Ticket deleted successfully');
    } catch (err) {
        return next(err);
    }
}

// ==================== TICKET MESSAGES ====================

async function addMessage(req, res, next) {
    try {
        const { TicketMessage, Ticket } = req.models;
        const { ticketId } = req.params;
        const {
            senderId,
            senderType,
            content,
            messageType = 'text',
            attachmentUrl,
            attachmentType,
            attachmentName,
            isInternal = false
        } = req.body || {};

        // Validate ticket exists
        const ticket = await Ticket.findByPk(ticketId);
        if (!ticket) return res.fail('Ticket not found', 404);

        // Validate required fields
        if (!senderId) return res.fail('`senderId` is required', 400);
        if (!senderType) return res.fail('`senderType` is required', 400);

        // Validate senderType
        const validSenderTypes = ['Enrollee', 'RetailEnrollee', 'Provider', 'Doctor', 'Admin', 'System'];
        if (!validSenderTypes.includes(senderType)) {
            return res.fail(`\`senderType\` must be one of: ${validSenderTypes.join(', ')}`, 400);
        }

        // For text messages, content is required
        if (messageType === 'text' && !content) {
            return res.fail('`content` is required for text messages', 400);
        }

        // For attachment messages, attachmentUrl is required
        if (messageType === 'attachment' && !attachmentUrl) {
            return res.fail('`attachmentUrl` is required for attachment messages', 400);
        }

        // Create the message
        const message = await TicketMessage.create({
            ticketId,
            senderId,
            senderType,
            messageType,
            content,
            attachmentUrl,
            attachmentType,
            attachmentName,
            isInternal
        });

        // Update ticket status if needed (first message from user might set it to in_progress)
        if (!isInternal && ticket.status === 'pending') {
            await ticket.update({ status: 'in_progress' });
        }

        await addAuditLog(req.models, {
            action: 'ticket.message.add',
            message: `Message added to support ticket #${ticket.ticketNumber}`,
            userId: (req.user && req.user.id) ? req.user.id : null,
            userType: (req.user && req.user.type) ? req.user.type : null,
            meta: { ticketId, messageId: message.id, ticketNumber: ticket.ticketNumber }
        });

        return res.success({ message: message.toJSON() }, 'Message added successfully', 201);
    } catch (err) {
        return next(err);
    }
}

async function getTicketMessages(req, res, next) {
    try {
        const { TicketMessage, Ticket } = req.models;
        const { ticketId } = req.params;
        const { limit = 20, page = 1, includeInternal = false } = req.query;

        // Verify ticket exists
        const ticket = await Ticket.findByPk(ticketId);
        if (!ticket) return res.fail('Ticket not found', 404);

        const limitNum = Number(limit);
        const pageNum = Number(page) || 1;
        const offset = (pageNum - 1) * limitNum;

        const where = { ticketId };

        // Filter internal messages based on user type
        if (includeInternal !== 'true') {
            where.isInternal = false;
        }

        const total = await TicketMessage.count({ where });

        const messages = await TicketMessage.findAll({
            where,
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

async function deleteMessage(req, res, next) {
    try {
        const { TicketMessage } = req.models;
        const { ticketId, messageId } = req.params;

        const message = await TicketMessage.findOne({
            where: { id: messageId, ticketId }
        });

        if (!message) return res.fail('Message not found', 404);

        await message.destroy();

        await addAuditLog(req.models, {
            action: 'ticket.message.delete',
            message: `Message deleted from support ticket #${ticketId}`,
            userId: (req.user && req.user.id) ? req.user.id : null,
            userType: (req.user && req.user.type) ? req.user.type : null,
            meta: { ticketId, messageId }
        });

        return res.success(null, 'Message deleted successfully');
    } catch (err) {
        return next(err);
    }
}

async function getTicketStats(req, res, next) {
    try {
        const { Ticket } = req.models;

        const stats = {
            total: await Ticket.count(),
            pending: await Ticket.count({ where: { status: 'pending' } }),
            inProgress: await Ticket.count({ where: { status: 'in_progress' } }),
            onHold: await Ticket.count({ where: { status: 'on_hold' } }),
            solved: await Ticket.count({ where: { status: 'solved' } }),
            closed: await Ticket.count({ where: { status: 'closed' } })
        };

        return res.success({ stats });
    } catch (err) {
        return next(err);
    }
}

module.exports = {
    createTicket,
    getTicket,
    listTickets,
    updateTicket,
    assignTicket,
    closeTicket,
    deleteTicket,
    addMessage,
    getTicketMessages,
    deleteMessage,
    getTicketStats
};
