'use strict';

const { Op } = require('sequelize');

const RETENTION_DAYS = 60;
const RETENTION_MS = RETENTION_DAYS * 24 * 60 * 60 * 1000;
const ACTIVE_STATUSES = ['pending', 'approved'];

function getAccountModel(models, userType) {
    if (userType === 'Enrollee') return models.Enrollee;
    if (userType === 'RetailEnrollee') return models.RetailEnrollee;
    return null;
}

function getRetentionExpiry(approvedAt = new Date()) {
    return new Date(new Date(approvedAt).getTime() + RETENTION_MS);
}

function serializeDeletionRequest(request, now = new Date()) {
    if (!request) return null;

    const raw = typeof request.toJSON === 'function' ? request.toJSON() : { ...request };
    const expiresAt = raw.retentionExpiresAt ? new Date(raw.retentionExpiresAt) : null;
    const remainingMs = expiresAt ? Math.max(0, expiresAt.getTime() - now.getTime()) : null;

    return {
        ...raw,
        retentionDays: RETENTION_DAYS,
        retentionDaysRemaining: remainingMs === null ? null : Math.ceil(remainingMs / (24 * 60 * 60 * 1000)),
        canCancel: raw.status === 'pending' || (raw.status === 'approved' && expiresAt && expiresAt > now)
    };
}

async function findCurrentDeletionRequest(models, userId, userType) {
    return models.AccountDeletionRequest.findOne({
        where: { userId, userType },
        order: [['createdAt', 'DESC']]
    });
}

async function hasDeletionAccessBlock(models, userId, userType, now = new Date()) {
    const request = await models.AccountDeletionRequest.findOne({
        where: {
            userId,
            userType,
            [Op.or]: [
                { status: 'archived' },
                {
                    status: 'approved',
                    retentionExpiresAt: { [Op.lte]: now }
                }
            ]
        },
        order: [['createdAt', 'DESC']]
    });

    return Boolean(request);
}

async function archiveRequest(models, request, options = {}) {
    const { transaction } = options;
    if (!request || request.status === 'archived') return request;

    const AccountModel = getAccountModel(models, request.userType);
    if (!AccountModel) throw new Error(`Unsupported deletion request user type: ${request.userType}`);

    await AccountModel.update(
        { isActive: false },
        { where: { id: request.userId }, transaction }
    );
    await request.update(
        { status: 'archived', archivedAt: new Date() },
        { transaction }
    );

    return request;
}

async function archiveExpiredRequests(models, now = new Date()) {
    const expired = await models.AccountDeletionRequest.findAll({
        where: {
            status: 'approved',
            retentionExpiresAt: { [Op.lte]: now }
        }
    });

    let archivedCount = 0;
    for (const candidate of expired) {
        await models.AccountDeletionRequest.sequelize.transaction(async (transaction) => {
            const request = await models.AccountDeletionRequest.findByPk(candidate.id, {
                transaction,
                lock: transaction.LOCK.UPDATE
            });
            if (!request || request.status !== 'approved' || new Date(request.retentionExpiresAt) > now) return;
            await archiveRequest(models, request, { transaction });
            archivedCount += 1;
        });
    }

    return archivedCount;
}

module.exports = {
    ACTIVE_STATUSES,
    RETENTION_DAYS,
    archiveExpiredRequests,
    archiveRequest,
    findCurrentDeletionRequest,
    getAccountModel,
    getRetentionExpiry,
    hasDeletionAccessBlock,
    serializeDeletionRequest
};
