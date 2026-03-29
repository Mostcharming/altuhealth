'use strict';

const { Op } = require('sequelize');
const { addAuditLog } = require('../../../utils/addAdminNotification');

/**
 * List all notification templates with optional search
 * Returns only name and subject for list view
 */
async function listNotificationTemplates(req, res, next) {
    try {
        const { NotificationTemplate } = req.models;
        const { q = '' } = req.query;

        const where = {};
        if (q) {
            where[Op.or] = [
                { name: { [Op.iLike || Op.like]: `%${q}%` } },
                { subj: { [Op.iLike || Op.like]: `%${q}%` } },
            ];
        }

        const rows = await NotificationTemplate.findAll({
            where,
            attributes: ['id', 'name', 'subj'],
            order: [['created_at', 'DESC']],
        });

        const data = rows.map((template) => ({
            id: template.id,
            name: template.name,
            subject: template.subj,
        }));

        return res.success(
            {
                data,
            },
            'Notification templates retrieved'
        );
    } catch (err) {
        return next(err);
    }
}

/**
 * Get notification template details by ID
 * Returns all fields for detail view
 */
async function getNotificationTemplateById(req, res, next) {
    try {
        const { NotificationTemplate } = req.models;
        const { id } = req.params;

        const template = await NotificationTemplate.findByPk(id);
        if (!template) {
            return res.fail('Notification template not found', 404);
        }

        const data = {
            id: template.id,
            act: template.act,
            name: template.name,
            subject: template.subj,
            emailBody: template.emailBody,
            smsBody: template.smsBody,
            emailStatus: template.emailStatus,
            smsStatus: template.smsStatus,
            shortcodes: template.shortcodes,
            createdAt: template.createdAt,
            updatedAt: template.updatedAt,
        };

        return res.success(data, 'Notification template retrieved');
    } catch (err) {
        return next(err);
    }
}

/**
 * Create a new notification template
 */
async function createNotificationTemplate(req, res, next) {
    try {
        const { NotificationTemplate } = req.models;
        const {
            act,
            name,
            subj,
            emailBody,
            smsBody,
            emailStatus = false,
            smsStatus = false,
            shortcodes = {},
        } = req.body || {};

        if (!act) return res.fail('`act` (action) is required', 400);
        if (!name) return res.fail('`name` is required', 400);

        // Check if act is unique
        const existing = await NotificationTemplate.findOne({ where: { act } });
        if (existing) {
            return res.fail('Notification template with this act already exists', 400);
        }

        const template = await NotificationTemplate.create({
            act,
            name,
            subj,
            emailBody,
            smsBody,
            emailStatus,
            smsStatus,
            shortcodes,
        });

        await addAuditLog(req.models, {
            action: 'notificationTemplate.create',
            message: `Notification template "${template.name}" created`,
            userId: req.user && req.user.id ? req.user.id : null,
            userType: req.user && req.user.type ? req.user.type : null,
            meta: { templateId: template.id },
        });

        return res.success({ template: template.toJSON() }, 'Notification template created', 201);
    } catch (err) {
        return next(err);
    }
}

/**
 * Update a notification template
 */
async function updateNotificationTemplate(req, res, next) {
    try {
        const { NotificationTemplate } = req.models;
        const { id } = req.params;
        const updates = req.body || {};

        const template = await NotificationTemplate.findByPk(id);
        if (!template) {
            return res.fail('Notification template not found', 404);
        }

        // Don't allow changing act
        delete updates.act;

        await template.update(updates);

        await addAuditLog(req.models, {
            action: 'notificationTemplate.update',
            message: `Notification template "${template.name}" updated`,
            userId: req.user && req.user.id ? req.user.id : null,
            userType: req.user && req.user.type ? req.user.type : null,
            meta: { templateId: template.id },
        });

        return res.success({ template: template.toJSON() }, 'Notification template updated');
    } catch (err) {
        return next(err);
    }
}

/**
 * Delete a notification template
 */
async function deleteNotificationTemplate(req, res, next) {
    try {
        const { NotificationTemplate } = req.models;
        const { id } = req.params;

        const template = await NotificationTemplate.findByPk(id);
        if (!template) {
            return res.fail('Notification template not found', 404);
        }

        const templateName = template.name;
        await template.destroy();

        await addAuditLog(req.models, {
            action: 'notificationTemplate.delete',
            message: `Notification template "${templateName}" deleted`,
            userId: req.user && req.user.id ? req.user.id : null,
            userType: req.user && req.user.type ? req.user.type : null,
            meta: { templateId: id },
        });

        return res.success(null, 'Notification template deleted');
    } catch (err) {
        return next(err);
    }
}

module.exports = {
    listNotificationTemplates,
    getNotificationTemplateById,
    createNotificationTemplate,
    updateNotificationTemplate,
    deleteNotificationTemplate,
};
