'use strict';

const { Op } = require('sequelize');
const { addAuditLog } = require('../../../utils/addAdminNotification');
const { createAdminApproval } = require('../../../utils/adminApproval');

async function createExclusion(req, res, next) {
    try {
        const { Exclusion } = req.models;
        const { description } = req.body || {};

        if (!description) return res.fail('`description` is required', 400);

        const exclusion = await Exclusion.create({ description });

        await addAuditLog(req.models, {
            action: 'exclusion.create',
            message: `Exclusion created`,
            userId: (req.user && req.user.id) ? req.user.id : null,
            userType: (req.user && req.user.type) ? req.user.type : null,
            meta: { exclusionId: exclusion.id }
        });

        // create an admin approval record for this exclusion and notify admins
        (async () => {
            try {
                const requestedBy = (req.user && req.user.id) ? req.user.id : 'system';
                const requestedByType = (req.user && req.user.type) ? req.user.type : 'Admin';

                await createAdminApproval(req.models, {
                    model: 'Exclusion',
                    modelId: exclusion.id,
                    action: 'create',
                    details: JSON.stringify({ description }),
                    requestedBy,
                    requestedByType,
                    comments: null,
                    meta: { exclusionDescription: description.substring(0, 100) }
                });

            } catch (err) {
                // don't fail the main request if approval creation fails
                if (console && console.warn) console.warn('Failed to create admin approval for exclusion:', err.message || err);
            }
        })();

        return res.success({ exclusion: exclusion.toJSON() }, 'Exclusion created', 201);
    } catch (err) {
        return next(err);
    }
}

async function updateExclusion(req, res, next) {
    try {
        const { Exclusion } = req.models;
        const { id } = req.params;
        const { description } = req.body || {};

        const exclusion = await Exclusion.findByPk(id);
        if (!exclusion) return res.fail('Exclusion not found', 404);

        const updates = {};
        if (description !== undefined) updates.description = description;

        await exclusion.update(updates);

        await addAuditLog(req.models, {
            action: 'exclusion.update',
            message: `Exclusion updated`,
            userId: (req.user && req.user.id) ? req.user.id : null,
            userType: (req.user && req.user.type) ? req.user.type : null,
            meta: { exclusionId: exclusion.id }
        });

        return res.success({ exclusion }, 'Exclusion updated');
    } catch (err) {
        return next(err);
    }
}

async function deleteExclusion(req, res, next) {
    try {
        const { Exclusion } = req.models;
        const { id } = req.params;

        const exclusion = await Exclusion.findByPk(id);
        if (!exclusion) return res.fail('Exclusion not found', 404);

        await exclusion.destroy();

        await addAuditLog(req.models, {
            action: 'exclusion.delete',
            message: `Exclusion deleted`,
            userId: (req.user && req.user.id) ? req.user.id : null,
            userType: (req.user && req.user.type) ? req.user.type : null,
            meta: { exclusionId: id }
        });

        return res.success(null, 'Exclusion deleted');
    } catch (err) {
        return next(err);
    }
}

async function listExclusions(req, res, next) {
    try {
        const { Exclusion } = req.models;
        const { limit = 10, page = 1, q } = req.query;

        const isAll = String(limit).toLowerCase() === 'all';
        const limitNum = isAll ? 0 : Number(limit);
        const pageNum = isAll ? 1 : (Number(page) || 1);
        const offset = isAll ? 0 : (pageNum - 1) * limitNum;

        const where = {};
        if (q) {
            where[Op.or] = [
                { description: { [Op.iLike || Op.like]: `%${q}%` } }
            ];
        }

        const total = await Exclusion.count({ where });

        const findOptions = {
            where,
            order: [['created_at', 'DESC']]
        };

        if (!isAll) {
            findOptions.limit = limitNum;
            findOptions.offset = Number(offset);
        }

        const exclusions = await Exclusion.findAll(findOptions);
        const data = exclusions.map(e => e.toJSON());

        const hasPrevPage = !isAll && pageNum > 1;
        const hasNextPage = !isAll && (offset + exclusions.length < total);
        const totalPages = isAll ? 1 : (limitNum > 0 ? Math.ceil(total / limitNum) : 1);

        return res.success({ list: data, count: total, page: pageNum, limit: isAll ? 'all' : limitNum, totalPages, hasNextPage, hasPrevPage });
    } catch (err) {
        return next(err);
    }
}

async function getExclusion(req, res, next) {
    try {
        const { Exclusion } = req.models;
        const { id } = req.params;

        const exclusion = await Exclusion.findByPk(id);
        if (!exclusion) return res.fail('Exclusion not found', 404);

        return res.success(exclusion.toJSON());
    } catch (err) {
        return next(err);
    }
}

module.exports = {
    createExclusion,
    updateExclusion,
    deleteExclusion,
    listExclusions,
    getExclusion
};
