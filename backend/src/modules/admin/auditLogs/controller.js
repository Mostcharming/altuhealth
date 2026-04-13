'use strict';

const { Op } = require('sequelize');

async function listAuditLogs(req, res, next) {
    try {
        const { AuditLog } = req.models;
        const { limit = 10, page = 1, q, userId, userType, action } = req.query;

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

        if (action) {
            where.action = action;
        }

        if (q) {
            where[Op.or] = [
                { action: { [Op.iLike || Op.like]: `%${q}%` } },
                { message: { [Op.iLike || Op.like]: `%${q}%` } },
                { userType: { [Op.iLike || Op.like]: `%${q}%` } }
            ];
        }

        const total = await AuditLog.count({ where });

        const findOptions = {
            where,
            order: [['createdAt', 'DESC']],
            attributes: ['id', 'userId', 'userType', 'action', 'message', 'meta', 'createdAt', 'updatedAt']
        };

        if (!isAll) {
            findOptions.limit = limitNum;
            findOptions.offset = Number(offset);
        }

        const auditLogs = await AuditLog.findAll(findOptions);
        const data = auditLogs.map(log => log.toJSON());

        const hasPrevPage = !isAll && pageNum > 1;
        const hasNextPage = !isAll && (offset + auditLogs.length < total);
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

async function getAuditLog(req, res, next) {
    try {
        const { AuditLog } = req.models;
        const { id } = req.params;

        const auditLog = await AuditLog.findByPk(id);
        if (!auditLog) {
            return res.fail('Audit log not found', 404);
        }

        return res.success({ auditLog: auditLog.toJSON() });
    } catch (err) {
        return next(err);
    }
}

module.exports = {
    listAuditLogs,
    getAuditLog
};
