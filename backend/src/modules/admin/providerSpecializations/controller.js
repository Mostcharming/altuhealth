'use strict';

const { Op } = require('sequelize');
const { addAuditLog } = require('../../../utils/addAdminNotification');
const { createAdminApproval } = require('../../../utils/adminApproval');

async function createProviderSpecialization(req, res, next) {
    try {
        const { ProviderSpecialization } = req.models;
        const { name, description } = req.body || {};

        if (!name) return res.fail('`name` is required', 400);

        const providerSpecialization = await ProviderSpecialization.create({ name, description });

        await addAuditLog(req.models, {
            action: 'providerSpecialization.create',
            message: `Provider Specialization created`,
            userId: (req.user && req.user.id) ? req.user.id : null,
            userType: (req.user && req.user.type) ? req.user.type : null,
            meta: { providerSpecializationId: providerSpecialization.id }
        });

        // create an admin approval record for this provider specialization and notify admins
        (async () => {
            try {
                const requestedBy = (req.user && req.user.id) ? req.user.id : 'system';
                const requestedByType = (req.user && req.user.type) ? req.user.type : 'Admin';

                await createAdminApproval(req.models, {
                    model: 'ProviderSpecialization',
                    modelId: providerSpecialization.id,
                    action: 'create',
                    details: JSON.stringify({ name, description }),
                    requestedBy,
                    requestedByType,
                    comments: null,
                    meta: { providerSpecializationName: name }
                });

            } catch (err) {
                // don't fail the main request if approval creation fails
                if (console && console.warn) console.warn('Failed to create admin approval for provider specialization:', err.message || err);
            }
        })();

        return res.success({ providerSpecialization: providerSpecialization.toJSON() }, 'Provider Specialization created', 201);
    } catch (err) {
        return next(err);
    }
}

async function updateProviderSpecialization(req, res, next) {
    try {
        const { ProviderSpecialization } = req.models;
        const { id } = req.params;
        const { name, description } = req.body || {};

        const providerSpecialization = await ProviderSpecialization.findByPk(id);
        if (!providerSpecialization) return res.fail('Provider Specialization not found', 404);

        const updates = {};
        if (name !== undefined) updates.name = name;
        if (description !== undefined) updates.description = description;

        await providerSpecialization.update(updates);

        await addAuditLog(req.models, {
            action: 'providerSpecialization.update',
            message: `Provider Specialization updated`,
            userId: (req.user && req.user.id) ? req.user.id : null,
            userType: (req.user && req.user.type) ? req.user.type : null,
            meta: { providerSpecializationId: providerSpecialization.id }
        });

        return res.success({ providerSpecialization }, 'Provider Specialization updated');
    } catch (err) {
        return next(err);
    }
}

async function deleteProviderSpecialization(req, res, next) {
    try {
        const { ProviderSpecialization } = req.models;
        const { id } = req.params;

        const providerSpecialization = await ProviderSpecialization.findByPk(id);
        if (!providerSpecialization) return res.fail('Provider Specialization not found', 404);

        await providerSpecialization.destroy();

        await addAuditLog(req.models, {
            action: 'providerSpecialization.delete',
            message: `Provider Specialization deleted`,
            userId: (req.user && req.user.id) ? req.user.id : null,
            userType: (req.user && req.user.type) ? req.user.type : null,
            meta: { providerSpecializationId: id }
        });

        return res.success(null, 'Provider Specialization deleted');
    } catch (err) {
        return next(err);
    }
}

async function listProviderSpecializations(req, res, next) {
    try {
        const { ProviderSpecialization } = req.models;
        const { limit = 10, page = 1, q } = req.query;

        const isAll = String(limit).toLowerCase() === 'all';
        const limitNum = isAll ? 0 : Number(limit);
        const pageNum = isAll ? 1 : (Number(page) || 1);
        const offset = isAll ? 0 : (pageNum - 1) * limitNum;

        const where = {};
        if (q) {
            where[Op.or] = [
                { name: { [Op.iLike || Op.like]: `%${q}%` } },
                { description: { [Op.iLike || Op.like]: `%${q}%` } }
            ];
        }

        const total = await ProviderSpecialization.count({ where });

        const findOptions = {
            where,
            order: [['created_at', 'DESC']]
        };

        if (!isAll) {
            findOptions.limit = limitNum;
            findOptions.offset = Number(offset);
        }

        const providerSpecializations = await ProviderSpecialization.findAll(findOptions);
        const data = providerSpecializations.map(p => p.toJSON());

        const hasPrevPage = !isAll && pageNum > 1;
        const hasNextPage = !isAll && (offset + providerSpecializations.length < total);
        const totalPages = isAll ? 1 : (limitNum > 0 ? Math.ceil(total / limitNum) : 1);

        return res.success({ list: data, count: total, page: pageNum, limit: isAll ? 'all' : limitNum, totalPages, hasNextPage, hasPrevPage });
    } catch (err) {
        return next(err);
    }
}

async function getProviderSpecialization(req, res, next) {
    try {
        const { ProviderSpecialization } = req.models;
        const { id } = req.params;

        const providerSpecialization = await ProviderSpecialization.findByPk(id);
        if (!providerSpecialization) return res.fail('Provider Specialization not found', 404);

        return res.success(providerSpecialization.toJSON());
    } catch (err) {
        return next(err);
    }
}

module.exports = {
    createProviderSpecialization,
    updateProviderSpecialization,
    deleteProviderSpecialization,
    listProviderSpecializations,
    getProviderSpecialization
};
