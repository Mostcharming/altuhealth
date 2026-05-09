const { Op } = require('sequelize');

async function listNotifications(req, res, next) {
    try {
        const { RetailEnrolleeDependentNotification } = req.models;
        const { retailEnrolleeDependentId, limit = 50, page = 1, isRead, notificationType } = req.query;

        if (!retailEnrolleeDependentId) {
            return res.fail('`retailEnrolleeDependentId` is required in query parameters', 400);
        }

        const where = { retailEnrolleeDependentId };

        if (typeof isRead !== 'undefined') {
            where.isRead = isRead === '1' || String(isRead).toLowerCase() === 'true';
        }

        if (notificationType) {
            where.notificationType = notificationType;
        }

        const offset = (Number(page) - 1) * Number(limit);

        const { count, rows } = await RetailEnrolleeDependentNotification.findAndCountAll({
            where,
            order: [['createdAt', 'DESC']],
            limit: Number(limit),
            offset: Number(offset)
        });

        return res.success({ data: rows, total: count, page: Number(page), limit: Number(limit) });
    } catch (err) {
        return next(err);
    }
}

async function updateNotificationStatus(req, res, next) {
    try {
        const { RetailEnrolleeDependentNotification } = req.models;
        const { id, ids, isRead } = req.body;
        const { retailEnrolleeDependentId } = req.query;

        if (!retailEnrolleeDependentId) {
            return res.fail('`retailEnrolleeDependentId` is required in query parameters', 400);
        }

        if (!id && !ids) {
            return res.fail('`id` or `ids` is required in request body', 400);
        }

        const readValue = typeof isRead === 'undefined' ? true : !!isRead;

        const where = { retailEnrolleeDependentId };
        if (ids && Array.isArray(ids) && ids.length) {
            where.id = { [Op.in]: ids };
        } else if (id) {
            where.id = id;
        }

        const result = await RetailEnrolleeDependentNotification.update({ isRead: readValue }, { where });
        const affected = Array.isArray(result) ? result[0] : result;

        const updated = await RetailEnrolleeDependentNotification.findAll({ where });

        return res.success({ updatedCount: affected, updated }, `${affected} notification(s) updated`);
    } catch (err) {
        return next(err);
    }
}

async function getUnreadCount(req, res, next) {
    try {
        const { RetailEnrolleeDependentNotification } = req.models;
        const { retailEnrolleeDependentId } = req.query;

        if (!retailEnrolleeDependentId) {
            return res.fail('`retailEnrolleeDependentId` is required in query parameters', 400);
        }

        const count = await RetailEnrolleeDependentNotification.count({
            where: { retailEnrolleeDependentId, isRead: false }
        });

        return res.success({ unreadCount: count });
    } catch (err) {
        return next(err);
    }
}

module.exports = {
    listNotifications,
    updateNotificationStatus,
    getUnreadCount
};
