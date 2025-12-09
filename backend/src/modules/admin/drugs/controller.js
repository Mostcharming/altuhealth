'use strict';

const { Op } = require('sequelize');
const { addAuditLog } = require('../../../utils/addAdminNotification');
const { createAdminApproval } = require('../../../utils/adminApproval');

async function createDrug(req, res, next) {
    try {
        const { Drug, Provider } = req.models;
        const {
            name,
            unit,
            description,
            strength,
            price,
            providerId,
            // status
        } = req.body || {};

        // Validate required fields
        if (!name) return res.fail('`name` is required', 400);
        if (!unit) return res.fail('`unit` is required', 400);
        if (!price) return res.fail('`price` is required', 400);
        if (!providerId) return res.fail('`providerId` is required', 400);

        // Verify provider exists
        const provider = await Provider.findByPk(providerId);
        if (!provider) return res.fail('Provider not found', 404);

        // Create drug
        const drug = await Drug.create({
            name,
            unit,
            description,
            strength,
            price,
            providerId,
            // status: status || 'pending'
        });

        // Create admin approval request
        try {
            await createAdminApproval(req.models, {
                model: 'Drug',
                modelId: drug.id,
                action: 'create',
                details: {
                    name: drug.name,
                    unit: drug.unit,
                    strength: drug.strength,
                    price: drug.price,
                    providerId: drug.providerId
                },
                requestedBy: (req.user && req.user.id) ? req.user.id : null,
                requestedByType: (req.user && req.user.type) ? req.user.type : 'Admin',
                comments: `New drug created: ${drug.name}`
            });
        } catch (approvalErr) {
            if (console && console.warn) console.warn('Failed to create approval for drug:', approvalErr.message || approvalErr);
        }

        await addAuditLog(req.models, {
            action: 'drug.create',
            message: `Drug ${drug.name} created for Provider ${provider.name}`,
            userId: (req.user && req.user.id) ? req.user.id : null,
            userType: (req.user && req.user.type) ? req.user.type : null,
            meta: { drugId: drug.id, providerId }
        });

        return res.success({ drug: drug.toJSON() }, 'Drug created', 201);
    } catch (err) {
        return next(err);
    }
}

async function updateDrug(req, res, next) {
    try {
        const { Drug } = req.models;
        const { id } = req.params;
        const {
            name,
            unit,
            description,
            strength,
            price,
            status
        } = req.body || {};

        const drug = await Drug.findByPk(id);
        if (!drug) return res.fail('Drug not found', 404);

        const updates = {};

        if (name !== undefined) updates.name = name;
        if (unit !== undefined) updates.unit = unit;
        if (description !== undefined) updates.description = description;
        if (strength !== undefined) updates.strength = strength;
        if (price !== undefined) updates.price = price;
        if (status !== undefined) updates.status = status;

        await drug.update(updates);

        await addAuditLog(req.models, {
            action: 'drug.update',
            message: `Drug ${drug.name} updated`,
            userId: (req.user && req.user.id) ? req.user.id : null,
            userType: (req.user && req.user.type) ? req.user.type : null,
            meta: { drugId: drug.id }
        });

        return res.success({ drug }, 'Drug updated');
    } catch (err) {
        return next(err);
    }
}

async function deleteDrug(req, res, next) {
    try {
        const { Drug } = req.models;
        const { id } = req.params;

        const drug = await Drug.findByPk(id);
        if (!drug) return res.fail('Drug not found', 404);

        await drug.destroy();

        await addAuditLog(req.models, {
            action: 'drug.delete',
            message: `Drug ${drug.name} deleted`,
            userId: (req.user && req.user.id) ? req.user.id : null,
            userType: (req.user && req.user.type) ? req.user.type : null,
            meta: { drugId: id }
        });

        return res.success(null, 'Drug deleted');
    } catch (err) {
        return next(err);
    }
}

async function listDrugs(req, res, next) {
    try {
        const { Drug, Provider } = req.models;
        const { limit = 10, page = 1, q, providerId, status } = req.query;

        const isAll = String(limit).toLowerCase() === 'all';
        const limitNum = isAll ? 0 : Number(limit);
        const pageNum = isAll ? 1 : (Number(page) || 1);
        const offset = isAll ? 0 : (pageNum - 1) * limitNum;

        const where = {};

        if (q) {
            where[Op.or] = [
                { name: { [Op.iLike || Op.like]: `%${q}%` } },
                { unit: { [Op.iLike || Op.like]: `%${q}%` } },
                { strength: { [Op.iLike || Op.like]: `%${q}%` } },
                { description: { [Op.iLike || Op.like]: `%${q}%` } }
            ];
        }

        if (providerId) where.providerId = providerId;
        if (status) where.status = status;

        const total = await Drug.count({ where });

        const findOptions = {
            where,
            include: [
                {
                    model: Provider,
                    attributes: ['id', 'name', 'code', 'email']
                }
            ],
            order: [['created_at', 'DESC']]
        };

        if (!isAll) {
            findOptions.limit = limitNum;
            findOptions.offset = Number(offset);
        }

        const drugs = await Drug.findAll(findOptions);
        const data = drugs.map(d => d.toJSON());

        const hasPrevPage = !isAll && pageNum > 1;
        const hasNextPage = !isAll && (offset + drugs.length < total);
        const totalPages = isAll ? 1 : (limitNum > 0 ? Math.ceil(total / limitNum) : 1);

        return res.success({ list: data, count: total, page: pageNum, limit: isAll ? 'all' : limitNum, totalPages, hasNextPage, hasPrevPage });
    } catch (err) {
        return next(err);
    }
}

async function getDrug(req, res, next) {
    try {
        const { Drug, Provider } = req.models;
        const { id } = req.params;

        const drug = await Drug.findByPk(id, {
            include: [
                {
                    model: Provider,
                    attributes: ['id', 'name', 'code', 'email', 'phoneNumber']
                }
            ]
        });

        if (!drug) return res.fail('Drug not found', 404);

        return res.success(drug.toJSON());
    } catch (err) {
        return next(err);
    }
}

async function deleteAllDrugsByProvider(req, res, next) {
    try {
        const { Drug, Provider } = req.models;
        const { providerId } = req.params;

        // Verify provider exists
        const provider = await Provider.findByPk(providerId);
        if (!provider) return res.fail('Provider not found', 404);

        // Get all drugs for this provider
        const drugs = await Drug.findAll({ where: { providerId } });

        if (drugs.length === 0) {
            return res.success({ count: 0 }, 'No drugs found for this provider');
        }

        // Delete all drugs for this provider
        await Drug.destroy({ where: { providerId } });

        await addAuditLog(req.models, {
            action: 'drug.deleteAll',
            message: `All drugs deleted for Provider ${provider.name} (${drugs.length} drugs)`,
            userId: (req.user && req.user.id) ? req.user.id : null,
            userType: (req.user && req.user.type) ? req.user.type : null,
            meta: { providerId, deletedCount: drugs.length }
        });

        return res.success({ count: drugs.length }, `${drugs.length} drug(s) deleted for provider`);
    } catch (err) {
        return next(err);
    }
}

module.exports = {
    createDrug,
    updateDrug,
    deleteDrug,
    listDrugs,
    getDrug,
    deleteAllDrugsByProvider
};
