'use strict';

const { Op } = require('sequelize');
const { addAdminNotification, addAuditLog } = require('../../../utils/addAdminNotification');

async function listApprovals(req, res, next) {
    try {
        const { AdminApproval } = req.models;
        const { limit = 10, page = 1, status, model, modelId } = req.query || {};

        const isAll = String(limit).toLowerCase() === 'all';
        const limitNum = isAll ? 0 : Number(limit);
        const pageNum = isAll ? 1 : (Number(page) || 1);
        const offset = isAll ? 0 : (pageNum - 1) * limitNum;

        const where = {};
        if (status) where.status = status;
        if (model) where.model = model;
        if (modelId) where.modelId = modelId;

        // total count for pagination
        const total = await AdminApproval.count({ where });

        const findOptions = {
            where,
            order: [['created_at', 'DESC']]
        };

        if (!isAll) {
            findOptions.limit = limitNum;
            findOptions.offset = Number(offset);
        }

        const approvals = await AdminApproval.findAll(findOptions);

        // Audit log for listing
        await addAuditLog(req.models, {
            action: 'adminApproval.list',
            message: `Admin approvals listed`,
            userId: (req.user && req.user.id) ? req.user.id : null,
            userType: (req.user && req.user.type) ? req.user.type : null,
            meta: { query: req.query }
        });

        return res.success({ list: approvals, count: total, page: pageNum, limit: isAll ? 'all' : limitNum }, 'Approvals listed');
    } catch (err) {
        return next(err);
    }
}

async function getApproval(req, res, next) {
    try {
        const { AdminApproval } = req.models;
        const { id } = req.params;

        const approval = await AdminApproval.findByPk(id);
        if (!approval) return res.fail('Approval not found', 404);

        // Audit log for get
        await addAuditLog(req.models, {
            action: 'adminApproval.get',
            message: `Admin approval ${id} fetched`,
            userId: (req.user && req.user.id) ? req.user.id : null,
            userType: (req.user && req.user.type) ? req.user.type : null,
            meta: { approvalId: id }
        });

        return res.success({ approval }, 'Approval fetched');
    } catch (err) {
        return next(err);
    }
}

async function performAction(req, res, next) {
    try {
        const { AdminApproval } = req.models;
        const { id } = req.params;
        const { action, comments, meta } = req.body || {};

        if (!action) return res.fail('`action` is required', 400);
        const a = String(action).toLowerCase();
        if (!['approve', 'decline'].includes(a)) return res.fail('Invalid action, allowed: approve, decline', 400);

        const approval = await AdminApproval.findByPk(id);
        if (!approval) return res.fail('Approval not found', 404);

        if (approval.status !== 'pending') {
            return res.fail('Approval already actioned', 400);
        }

        const newStatus = a === 'approve' ? 'approved' : 'declined';

        await approval.update({
            status: newStatus,
            actionedBy: (req.user && req.user.id) ? req.user.id : null,
            actionedByType: (req.user && req.user.type) ? req.user.type : null,
            comments: (comments != null) ? comments : approval.comments,
            meta: (meta != null) ? meta : approval.meta
        });

        // Audit log for the performed action
        await addAuditLog(req.models, {
            action: `adminApproval.${a}`,
            message: `Admin approval ${id} ${newStatus}`,
            userId: (req.user && req.user.id) ? req.user.id : null,
            userType: (req.user && req.user.type) ? req.user.type : null,
            meta: { approvalId: id, status: newStatus }
        });

        // Notify via admin notification (best-effort)
        try {
            const title = `Approval ${newStatus}: ${approval.model}`;
            await addAdminNotification(req.models, { title, clickUrl: `approval/${id}` });
        } catch (err) {
            if (console && console.warn) console.warn('Failed to create admin notification after approval action:', err.message || err);
        }

        return res.success({ approval }, `Approval ${newStatus}`);
    } catch (err) {
        return next(err);
    }
}

module.exports = {
    listApprovals,
    getApproval,
    performAction
};
