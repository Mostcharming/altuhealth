'use strict';

const { Op } = require('sequelize');
const { addAuditLog } = require('../../../utils/addAdminNotification');

async function createConversation(req, res, next) {
    try {
        const { Conversation, Admin, Enrollee, RetailEnrollee, Provider, Staff } = req.models;
        const {
            conversationType,
            senderId,
            senderType,
            receiverId,
            receiverType,
            subject,
            description,
            priority,
            category,
            assignedToId,
            relatedEntityType,
            relatedEntityId
        } = req.body || {};

        // Validation
        if (!subject) return res.error('Subject is required', 400);
        if (!conversationType) return res.error('Conversation type is required', 400);
        if (!senderType) return res.error('Sender type is required', 400);
        if (!receiverType) return res.error('Receiver type is required', 400);

        // Verify sender exists if not Admin/System
        if (senderType !== 'Admin' && senderType !== 'System') {
            if (!senderId) return res.error('Sender ID required for non-Admin senders', 400);
            // Verify sender entity exists based on type
            await verifySenderOrReceiver(req.models, senderId, senderType);
        }

        // Verify receiver exists if not Admin/System
        if (receiverType !== 'Admin' && receiverType !== 'System') {
            if (!receiverId) return res.error('Receiver ID required for non-Admin receivers', 400);
            await verifySenderOrReceiver(req.models, receiverId, receiverType);
        }

        // Verify assigned admin if provided
        if (assignedToId) {
            const admin = await Admin.findByPk(assignedToId);
            if (!admin) return res.error('Assigned admin not found', 404);
        }

        const conversation = await Conversation.create({
            conversationType: conversationType || 'message',
            senderId: senderType === 'Admin' || senderType === 'System' ? null : senderId,
            senderType,
            receiverId: receiverType === 'Admin' || receiverType === 'System' ? null : receiverId,
            receiverType,
            subject,
            description: description || null,
            priority: priority || 'medium',
            category: category || null,
            assignedToId: assignedToId || null,
            relatedEntityType: relatedEntityType || null,
            relatedEntityId: relatedEntityId || null,
            status: 'open',
            messageCount: 0,
            lastMessageAt: null
        });

        await addAuditLog(req.models, {
            action: 'conversation.create',
            message: `Conversation created: ${subject}`,
            userId: (req.user && req.user.id) ? req.user.id : null,
            userType: (req.user && req.user.type) ? req.user.type : null,
            meta: { conversationId: conversation.id, conversationType, priority }
        });

        return res.success(conversation.toJSON(), 'Conversation created', 201);
    } catch (err) {
        return next(err);
    }
}

async function getConversation(req, res, next) {
    try {
        const { Conversation, Message, Admin } = req.models;
        const { id } = req.params;

        const conversation = await Conversation.findByPk(id, {
            include: [
                {
                    model: Admin,
                    attributes: ['id', 'firstName', 'lastName', 'email'],
                    as: 'assignedAdmin',
                    required: false
                },
                {
                    model: Message,
                    attributes: ['id', 'senderId', 'senderType', 'messageType', 'content', 'isInternal', 'status', 'createdAt'],
                    as: 'messages',
                    required: false,
                    separate: true,
                    order: [['createdAt', 'ASC']],
                    limit: 10
                }
            ]
        });

        if (!conversation) return res.error('Conversation not found', 404);

        return res.success(conversation.toJSON());
    } catch (err) {
        return next(err);
    }
}

async function listConversations(req, res, next) {
    try {
        const { Conversation, Admin } = req.models;
        const {
            limit = 10,
            page = 1,
            q,
            status,
            priority,
            conversationType,
            senderType,
            senderIdtype,
            assignedToId,
            isArchived
        } = req.query;

        const isAll = String(limit).toLowerCase() === 'all';
        const limitNum = isAll ? 0 : Number(limit);
        const pageNum = isAll ? 1 : (Number(page) || 1);
        const offset = isAll ? 0 : (pageNum - 1) * limitNum;

        const where = {};

        if (status) where.status = status;
        if (priority) where.priority = priority;
        if (conversationType) where.conversationType = conversationType;
        if (senderType) where.senderType = senderType;
        if (assignedToId) where.assignedToId = assignedToId;
        if (isArchived !== undefined) where.isArchived = isArchived === 'true';

        if (q) {
            where[Op.or] = [
                { subject: { [Op.iLike]: `%${q}%` } },
                { description: { [Op.iLike]: `%${q}%` } },
                { category: { [Op.iLike]: `%${q}%` } }
            ];
        }

        const total = await Conversation.count({ where });

        const findOptions = {
            where,
            order: [['lastMessageAt', 'DESC'], ['createdAt', 'DESC']],
            include: [
                {
                    model: Admin,
                    attributes: ['id', 'firstName', 'lastName', 'email'],
                    as: 'assignedAdmin',
                    required: false
                }
            ]
        };

        if (!isAll) {
            findOptions.limit = limitNum;
            findOptions.offset = offset;
        }

        const conversations = await Conversation.findAll(findOptions);
        const data = conversations.map(conv => conv.toJSON());

        const hasPrevPage = !isAll && pageNum > 1;
        const hasNextPage = !isAll && (offset + conversations.length < total);
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

async function updateConversation(req, res, next) {
    try {
        const { Conversation } = req.models;
        const { id } = req.params;
        const { subject, description, priority, category, notes } = req.body || {};

        const conversation = await Conversation.findByPk(id);
        if (!conversation) return res.error('Conversation not found', 404);

        const updates = {};
        if (subject !== undefined) updates.subject = subject;
        if (description !== undefined) updates.description = description;
        if (priority !== undefined) updates.priority = priority;
        if (category !== undefined) updates.category = category;
        if (notes !== undefined) updates.notes = notes;

        await conversation.update(updates);

        await addAuditLog(req.models, {
            action: 'conversation.update',
            message: `Conversation updated`,
            userId: (req.user && req.user.id) ? req.user.id : null,
            userType: (req.user && req.user.type) ? req.user.type : null,
            meta: { conversationId: id }
        });

        return res.success(conversation.toJSON(), 'Conversation updated');
    } catch (err) {
        return next(err);
    }
}

async function deleteConversation(req, res, next) {
    try {
        const { Conversation } = req.models;
        const { id } = req.params;

        const conversation = await Conversation.findByPk(id);
        if (!conversation) return res.error('Conversation not found', 404);

        await conversation.destroy();

        await addAuditLog(req.models, {
            action: 'conversation.delete',
            message: `Conversation deleted`,
            userId: (req.user && req.user.id) ? req.user.id : null,
            userType: (req.user && req.user.type) ? req.user.type : null,
            meta: { conversationId: id }
        });

        return res.success(null, 'Conversation deleted');
    } catch (err) {
        return next(err);
    }
}

async function addMessage(req, res, next) {
    try {
        const { Conversation, Message } = req.models;
        const { id } = req.params;
        const {
            senderId,
            senderType,
            receiverId,
            receiverType,
            messageType,
            subject,
            content,
            attachmentUrl,
            attachmentType,
            attachmentName,
            isInternal,
            relatedMessageId,
            systemMetadata,
            notes
        } = req.body || {};

        // Validation
        if (!content) return res.error('Message content is required', 400);
        if (!senderType) return res.error('Sender type is required', 400);
        if (!receiverType) return res.error('Receiver type is required', 400);

        const conversation = await Conversation.findByPk(id);
        if (!conversation) return res.error('Conversation not found', 404);

        // Verify sender exists if not Admin/System
        if (senderType !== 'Admin' && senderType !== 'System') {
            if (!senderId) return res.error('Sender ID required for non-Admin senders', 400);
            await verifySenderOrReceiver(req.models, senderId, senderType);
        }

        // Verify receiver exists if not Admin/System
        if (receiverType !== 'Admin' && receiverType !== 'System') {
            if (!receiverId) return res.error('Receiver ID required for non-Admin receivers', 400);
            await verifySenderOrReceiver(req.models, receiverId, receiverType);
        }

        const message = await Message.create({
            conversationId: id,
            senderId: senderType === 'Admin' || senderType === 'System' ? null : senderId,
            senderType,
            receiverId: receiverType === 'Admin' || receiverType === 'System' ? null : receiverId,
            receiverType,
            messageType: messageType || 'text',
            subject: subject || null,
            content,
            attachmentUrl: attachmentUrl || null,
            attachmentType: attachmentType || null,
            attachmentName: attachmentName || null,
            isInternal: isInternal || false,
            relatedMessageId: relatedMessageId || null,
            systemMetadata: systemMetadata || null,
            notes: notes || null,
            status: 'sent'
        });

        // Update conversation metadata
        await conversation.increment('messageCount');
        await conversation.update({ lastMessageAt: new Date() });

        await addAuditLog(req.models, {
            action: 'message.create',
            message: `Message added to conversation`,
            userId: (req.user && req.user.id) ? req.user.id : null,
            userType: (req.user && req.user.type) ? req.user.type : null,
            meta: { conversationId: id, messageId: message.id, messageType }
        });

        return res.success(message.toJSON(), 'Message added', 201);
    } catch (err) {
        return next(err);
    }
}

async function listMessages(req, res, next) {
    try {
        const { Message } = req.models;
        const { id } = req.params;
        const { limit = 20, page = 1, messageType, isInternal } = req.query;

        const isAll = String(limit).toLowerCase() === 'all';
        const limitNum = isAll ? 0 : Number(limit);
        const pageNum = isAll ? 1 : (Number(page) || 1);
        const offset = isAll ? 0 : (pageNum - 1) * limitNum;

        const where = { conversationId: id };

        if (messageType) where.messageType = messageType;
        if (isInternal !== undefined) where.isInternal = isInternal === 'true';

        const total = await Message.count({ where });

        const findOptions = {
            where,
            order: [['createdAt', 'DESC']]
        };

        if (!isAll) {
            findOptions.limit = limitNum;
            findOptions.offset = offset;
        }

        const messages = await Message.findAll(findOptions);
        const data = messages.map(msg => msg.toJSON());

        const hasPrevPage = !isAll && pageNum > 1;
        const hasNextPage = !isAll && (offset + messages.length < total);
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

async function updateMessage(req, res, next) {
    try {
        const { Message } = req.models;
        const { id, messageId } = req.params;
        const { content, subject, notes } = req.body || {};

        const message = await Message.findByPk(messageId);
        if (!message) return res.error('Message not found', 404);

        if (message.conversationId !== id) {
            return res.error('Message does not belong to this conversation', 400);
        }

        const updates = {};
        if (content !== undefined) updates.content = content;
        if (subject !== undefined) updates.subject = subject;
        if (notes !== undefined) updates.notes = notes;

        await message.update(updates);

        await addAuditLog(req.models, {
            action: 'message.update',
            message: `Message updated`,
            userId: (req.user && req.user.id) ? req.user.id : null,
            userType: (req.user && req.user.type) ? req.user.type : null,
            meta: { conversationId: id, messageId }
        });

        return res.success(message.toJSON(), 'Message updated');
    } catch (err) {
        return next(err);
    }
}

async function deleteMessage(req, res, next) {
    try {
        const { Message } = req.models;
        const { id, messageId } = req.params;

        const message = await Message.findByPk(messageId);
        if (!message) return res.error('Message not found', 404);

        if (message.conversationId !== id) {
            return res.error('Message does not belong to this conversation', 400);
        }

        await message.destroy();

        const { Conversation } = req.models;
        const conversation = await Conversation.findByPk(id);
        if (conversation) {
            await conversation.decrement('messageCount');
        }

        await addAuditLog(req.models, {
            action: 'message.delete',
            message: `Message deleted`,
            userId: (req.user && req.user.id) ? req.user.id : null,
            userType: (req.user && req.user.type) ? req.user.type : null,
            meta: { conversationId: id, messageId }
        });

        return res.success(null, 'Message deleted');
    } catch (err) {
        return next(err);
    }
}

async function markMessageAsRead(req, res, next) {
    try {
        const { Message } = req.models;
        const { id, messageId } = req.params;

        const message = await Message.findByPk(messageId);
        if (!message) return res.error('Message not found', 404);

        if (message.conversationId !== id) {
            return res.error('Message does not belong to this conversation', 400);
        }

        await message.update({
            status: 'read',
            readAt: new Date()
        });

        return res.success(message.toJSON(), 'Message marked as read');
    } catch (err) {
        return next(err);
    }
}

async function updateConversationStatus(req, res, next) {
    try {
        const { Conversation, Message } = req.models;
        const { id } = req.params;
        const { status } = req.body || {};

        if (!status) return res.error('Status is required', 400);

        const validStatuses = ['open', 'in_progress', 'solved', 'on_hold', 'closed', 'reopened'];
        if (!validStatuses.includes(status)) {
            return res.error(`Invalid status. Must be one of: ${validStatuses.join(', ')}`, 400);
        }

        const conversation = await Conversation.findByPk(id);
        if (!conversation) return res.error('Conversation not found', 404);

        const updates = { status };

        // Update resolved/closed timestamps based on status
        if (status === 'solved' && !conversation.resolvedAt) {
            updates.resolvedAt = new Date();
        }
        if (status === 'closed' && !conversation.closedAt) {
            updates.closedAt = new Date();
        }

        await conversation.update(updates);

        // Log status change
        await Message.create({
            conversationId: id,
            senderType: 'System',
            receiverType: 'Admin',
            messageType: 'status_update',
            content: `Conversation status changed to ${status}`,
            isInternal: true,
            systemMetadata: {
                oldStatus: conversation.status,
                newStatus: status
            }
        });

        await addAuditLog(req.models, {
            action: 'conversation.status.update',
            message: `Conversation status updated to ${status}`,
            userId: (req.user && req.user.id) ? req.user.id : null,
            userType: (req.user && req.user.type) ? req.user.type : null,
            meta: { conversationId: id, oldStatus: conversation.status, newStatus: status }
        });

        return res.success(conversation.toJSON(), 'Conversation status updated');
    } catch (err) {
        return next(err);
    }
}

async function assignConversation(req, res, next) {
    try {
        const { Conversation, Admin, Message } = req.models;
        const { id } = req.params;
        const { assignedToId } = req.body || {};

        if (!assignedToId) return res.error('Assigned admin ID is required', 400);

        const conversation = await Conversation.findByPk(id);
        if (!conversation) return res.error('Conversation not found', 404);

        const admin = await Admin.findByPk(assignedToId);
        if (!admin) return res.error('Admin not found', 404);

        const oldAssignee = conversation.assignedToId;
        await conversation.update({ assignedToId });

        // Log assignment
        await Message.create({
            conversationId: id,
            senderType: 'System',
            receiverType: 'Admin',
            messageType: 'assignment',
            content: `Conversation assigned to ${admin.firstName} ${admin.lastName}`,
            isInternal: true,
            systemMetadata: {
                oldAssigneeId: oldAssignee,
                newAssigneeId: assignedToId,
                assigneeName: `${admin.firstName} ${admin.lastName}`
            }
        });

        await addAuditLog(req.models, {
            action: 'conversation.assign',
            message: `Conversation assigned to ${admin.firstName} ${admin.lastName}`,
            userId: (req.user && req.user.id) ? req.user.id : null,
            userType: (req.user && req.user.type) ? req.user.type : null,
            meta: { conversationId: id, assignedToId }
        });

        return res.success(conversation.toJSON(), 'Conversation assigned');
    } catch (err) {
        return next(err);
    }
}

async function archiveConversation(req, res, next) {
    try {
        const { Conversation } = req.models;
        const { id } = req.params;

        const conversation = await Conversation.findByPk(id);
        if (!conversation) return res.error('Conversation not found', 404);

        await conversation.update({ isArchived: true });

        await addAuditLog(req.models, {
            action: 'conversation.archive',
            message: `Conversation archived`,
            userId: (req.user && req.user.id) ? req.user.id : null,
            userType: (req.user && req.user.type) ? req.user.type : null,
            meta: { conversationId: id }
        });

        return res.success(conversation.toJSON(), 'Conversation archived');
    } catch (err) {
        return next(err);
    }
}

async function unarchiveConversation(req, res, next) {
    try {
        const { Conversation } = req.models;
        const { id } = req.params;

        const conversation = await Conversation.findByPk(id);
        if (!conversation) return res.error('Conversation not found', 404);

        await conversation.update({ isArchived: false });

        await addAuditLog(req.models, {
            action: 'conversation.unarchive',
            message: `Conversation unarchived`,
            userId: (req.user && req.user.id) ? req.user.id : null,
            userType: (req.user && req.user.type) ? req.user.type : null,
            meta: { conversationId: id }
        });

        return res.success(conversation.toJSON(), 'Conversation unarchived');
    } catch (err) {
        return next(err);
    }
}

// Helper function to verify sender/receiver exists
async function verifySenderOrReceiver(models, entityId, entityType) {
    const { Enrollee, RetailEnrollee, Provider, Staff, Admin } = models;

    let entity;
    switch (entityType) {
        case 'Enrollee':
            entity = await Enrollee.findByPk(entityId);
            break;
        case 'RetailEnrollee':
            entity = await RetailEnrollee.findByPk(entityId);
            break;
        case 'Provider':
            entity = await Provider.findByPk(entityId);
            break;
        case 'Staff':
            entity = await Staff.findByPk(entityId);
            break;
        case 'Admin':
            entity = await Admin.findByPk(entityId);
            break;
        default:
            throw new Error(`Invalid entity type: ${entityType}`);
    }

    if (!entity) {
        throw new Error(`${entityType} with ID ${entityId} not found`);
    }

    return entity;
}

module.exports = {
    createConversation,
    getConversation,
    listConversations,
    updateConversation,
    deleteConversation,
    addMessage,
    listMessages,
    updateMessage,
    deleteMessage,
    markMessageAsRead,
    updateConversationStatus,
    assignConversation,
    archiveConversation,
    unarchiveConversation
};
