'use strict';

const { Op } = require('sequelize');
const { addAuditLog } = require('../../../utils/addAdminNotification');
const { getRetentionExpiry, serializeDeletionRequest } = require('../../../services/accountDeletionService');

const VALID_STATUSES = ['pending', 'approved', 'declined', 'cancelled', 'archived'];

function memberSummary(member, userType) {
    if (!member) return null;
    const raw = typeof member.toJSON === 'function' ? member.toJSON() : member;
    return {
        id: raw.id,
        firstName: raw.firstName,
        lastName: raw.lastName,
        email: raw.email,
        phoneNumber: raw.phoneNumber,
        policyNumber: raw.policyNumber,
        isActive: raw.isActive,
        type: userType
    };
}

async function hydrateRequests(models, requests) {
    const corporateIds = requests.filter((item) => item.userType === 'Enrollee').map((item) => item.userId);
    const retailIds = requests.filter((item) => item.userType === 'RetailEnrollee').map((item) => item.userId);
    const [corporate, retail] = await Promise.all([
        corporateIds.length ? models.Enrollee.findAll({ where: { id: corporateIds } }) : [],
        retailIds.length ? models.RetailEnrollee.findAll({ where: { id: retailIds } }) : []
    ]);
    const memberMap = new Map();
    corporate.forEach((member) => memberMap.set(`Enrollee:${member.id}`, memberSummary(member, 'Enrollee')));
    retail.forEach((member) => memberMap.set(`RetailEnrollee:${member.id}`, memberSummary(member, 'RetailEnrollee')));

    return requests.map((request) => ({
        ...serializeDeletionRequest(request),
        enrollee: memberMap.get(`${request.userType}:${request.userId}`) || null
    }));
}

async function matchingMemberIds(models, q) {
    const pattern = `%${q.trim()}%`;
    const searchable = {
        [Op.or]: [
            { firstName: { [Op.iLike]: pattern } },
            { lastName: { [Op.iLike]: pattern } },
            { email: { [Op.iLike]: pattern } },
            { policyNumber: { [Op.iLike]: pattern } }
        ]
    };
    const attributes = ['id'];
    const [corporate, retail] = await Promise.all([
        models.Enrollee.findAll({ where: searchable, attributes }),
        models.RetailEnrollee.findAll({ where: searchable, attributes })
    ]);
    return {
        corporate: corporate.map((member) => member.id),
        retail: retail.map((member) => member.id)
    };
}

async function listRequests(req, res, next) {
    try {
        const { AccountDeletionRequest, Admin } = req.models;
        const page = Math.max(1, Number(req.query.page) || 1);
        const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 20));
        const status = req.query.status ? String(req.query.status).toLowerCase() : '';
        const q = typeof req.query.q === 'string' ? req.query.q.trim() : '';
        if (status && !VALID_STATUSES.includes(status)) return res.fail('Invalid deletion request status', 400);

        const where = {};
        if (status) where.status = status;
        if (q) {
            const memberIds = await matchingMemberIds(req.models, q);
            where[Op.or] = [
                { reason: { [Op.iLike]: `%${q}%` } },
                { userType: 'Enrollee', userId: { [Op.in]: memberIds.corporate } },
                { userType: 'RetailEnrollee', userId: { [Op.in]: memberIds.retail } }
            ];
        }

        const { count, rows } = await AccountDeletionRequest.findAndCountAll({
            where,
            include: [{ model: Admin, as: 'reviewer', attributes: ['id', 'firstName', 'lastName', 'email'], required: false }],
            order: [['createdAt', 'DESC']],
            limit,
            offset: (page - 1) * limit,
            distinct: true
        });
        const list = await hydrateRequests(req.models, rows);

        return res.success({
            list,
            count,
            page,
            limit,
            totalPages: Math.max(1, Math.ceil(count / limit)),
            hasNextPage: page * limit < count,
            hasPrevPage: page > 1
        }, 'Account deletion requests listed');
    } catch (err) {
        return next(err);
    }
}

async function getRequest(req, res, next) {
    try {
        const { AccountDeletionRequest, Admin } = req.models;
        const request = await AccountDeletionRequest.findByPk(req.params.id, {
            include: [{ model: Admin, as: 'reviewer', attributes: ['id', 'firstName', 'lastName', 'email'], required: false }]
        });
        if (!request) return res.fail('Account deletion request not found', 404);
        const [result] = await hydrateRequests(req.models, [request]);
        return res.success({ request: result }, 'Account deletion request fetched');
    } catch (err) {
        return next(err);
    }
}

async function actionRequest(req, res, next, action) {
    try {
        const { AccountDeletionRequest } = req.models;
        const adminNote = typeof req.body?.adminNote === 'string' ? req.body.adminNote.trim() : null;
        if (adminNote && adminNote.length > 2000) return res.fail('Admin note must not exceed 2000 characters', 400);

        let request;
        await AccountDeletionRequest.sequelize.transaction(async (transaction) => {
            request = await AccountDeletionRequest.findByPk(req.params.id, {
                transaction,
                lock: transaction.LOCK.UPDATE
            });
            if (!request) {
                const error = new Error('Account deletion request not found');
                error.status = 404;
                throw error;
            }
            if (request.status !== 'pending') {
                const error = new Error('Only pending deletion requests can be reviewed');
                error.status = 409;
                throw error;
            }

            const now = new Date();
            const updates = {
                status: action === 'approve' ? 'approved' : 'declined',
                adminNote: adminNote || null,
                reviewedBy: req.user?.id || null,
                reviewedAt: now
            };
            if (action === 'approve') {
                updates.approvedAt = now;
                updates.retentionExpiresAt = getRetentionExpiry(now);
            }
            await request.update(updates, { transaction });
        });

        await addAuditLog(req.models, {
            action: `accountDeletion.${action}`,
            message: `Account deletion request ${request.id} ${action === 'approve' ? 'approved' : 'declined'}`,
            userId: req.user?.id || null,
            userType: req.user?.type || 'Admin',
            meta: { requestId: request.id, enrolleeId: request.userId, enrolleeType: request.userType }
        }).catch(() => null);

        const [result] = await hydrateRequests(req.models, [request]);
        return res.success({ request: result }, `Account deletion request ${action === 'approve' ? 'approved' : 'declined'}`);
    } catch (err) {
        return next(err);
    }
}

const approveRequest = (req, res, next) => actionRequest(req, res, next, 'approve');
const declineRequest = (req, res, next) => actionRequest(req, res, next, 'decline');

module.exports = { listRequests, getRequest, approveRequest, declineRequest };
