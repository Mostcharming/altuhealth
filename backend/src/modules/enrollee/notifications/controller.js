const { Op } = require('sequelize');

function resolveNotificationContext(req) {
    if (req.user?.type === 'RetailEnrollee') {
        return {
            model: req.models.RetailEnrolleeNotification,
            ownerKey: 'retailEnrolleeId'
        };
    }

    if (req.user?.type === 'Enrollee') {
        return {
            model: req.models.EnrolleeNotification,
            ownerKey: 'enrolleeId'
        };
    }

    return null;
}

async function listNotifications(req, res, next) {
    try {
        const context = resolveNotificationContext(req);
        const { limit = 50, page = 1, isRead, notificationType } = req.query;
        const userId = req.user?.id;

        if (!context || !userId) return res.fail('Unsupported enrollee account type', 403);

        const where = { [context.ownerKey]: userId };

        if (typeof isRead !== 'undefined') {
            where.isRead = isRead === '1' || String(isRead).toLowerCase() === 'true';
        }

        if (notificationType) {
            where.notificationType = notificationType;
        }

        const offset = (Number(page) - 1) * Number(limit);

        const { count, rows } = await context.model.findAndCountAll({
            where,
            order: [['createdAt', 'DESC']],
            limit: Number(limit),
            offset: Number(offset)
        });

        return res.success({ data: rows, total: count, page: Number(page), limit: Number(limit) });
    } catch (err) {
        console.log(err)
        return next(err);
    }
}

async function updateNotificationStatus(req, res, next) {
    try {
        const context = resolveNotificationContext(req);
        const { id, ids, isRead } = req.body || {};
        const userId = req.user?.id;

        if (!context || !userId) return res.fail('Unsupported enrollee account type', 403);

        if (!id && !ids) {
            return res.fail('`id` or `ids` is required in request body', 400);
        }

        const readValue = typeof isRead === 'undefined' ? true : !!isRead;

        const where = { [context.ownerKey]: userId };
        if (ids && Array.isArray(ids) && ids.length) {
            where.id = { [Op.in]: ids };
        } else if (id) {
            where.id = id;
        }

        const result = await context.model.update({ isRead: readValue }, { where });
        const affected = Array.isArray(result) ? result[0] : result;

        const updated = await context.model.findAll({ where });

        return res.success({ updatedCount: affected, updated }, `${affected} notification(s) updated`);
    } catch (err) {
        return next(err);
    }
}

async function getUnreadCount(req, res, next) {
    try {
        const context = resolveNotificationContext(req);
        const userId = req.user?.id;

        if (!context || !userId) return res.fail('Unsupported enrollee account type', 403);

        const count = await context.model.count({
            where: { [context.ownerKey]: userId, isRead: false }
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
