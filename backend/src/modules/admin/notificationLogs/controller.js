'use strict';

const { Op } = require('sequelize');

async function listNotificationLogs(req, res, next) {
    try {
        const { NotificationLog } = req.models;
        const { limit = 10, page = 1, q, userId, userType, notificationType, sentTo } = req.query;

        const isAll = String(limit).toLowerCase() === 'all';
        const limitNum = isAll ? 0 : Number(limit);
        const pageNum = isAll ? 1 : (Number(page) || 1);
        const offset = isAll ? 0 : (pageNum - 1) * limitNum;

        const where = {};

        if (userId) {
            where.userId = userId;
        }

        if (userType) {
            where.userType = userType;
        }

        if (notificationType) {
            where.notificationType = notificationType;
        }

        if (sentTo) {
            where.sentTo = sentTo;
        }

        if (q) {
            where[Op.or] = [
                { subject: { [Op.iLike || Op.like]: `%${q}%` } },
                { message: { [Op.iLike || Op.like]: `%${q}%` } },
                { notificationType: { [Op.iLike || Op.like]: `%${q}%` } },
                { sentTo: { [Op.iLike || Op.like]: `%${q}%` } }
            ];
        }

        const total = await NotificationLog.count({ where });

        const findOptions = {
            where,
            order: [['createdAt', 'DESC']],
            attributes: ['id', 'userId', 'userType', 'sentTo', 'subject', 'message', 'notificationType', 'createdAt', 'updatedAt']
        };

        if (!isAll) {
            findOptions.limit = limitNum;
            findOptions.offset = Number(offset);
        }

        const notifications = await NotificationLog.findAll(findOptions);
        const data = notifications.map(notif => notif.toJSON());

        const hasPrevPage = !isAll && pageNum > 1;
        const hasNextPage = !isAll && (offset + notifications.length < total);
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

async function getNotificationLog(req, res, next) {
    try {
        const { NotificationLog } = req.models;
        const { id } = req.params;

        const notification = await NotificationLog.findByPk(id);
        if (!notification) {
            return res.fail('Notification not found', 404);
        }

        return res.success({ notification: notification.toJSON() });
    } catch (err) {
        return next(err);
    }
}

module.exports = {
    listNotificationLogs,
    getNotificationLog
};
