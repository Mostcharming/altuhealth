'use strict';

const { Op } = require('sequelize');
const { addAuditLog } = require('../../../utils/addAdminNotification');

async function createService(req, res, next) {
    try {
        const { Service, Provider } = req.models;
        const {
            name,
            code,
            description,
            requiresPreauthorization,
            price,
            providerId,
            status
        } = req.body || {};

        // Validate required fields
        if (!name) return res.fail('`name` is required', 400);
        if (!code) return res.fail('`code` is required', 400);
        if (!price) return res.fail('`price` is required', 400);
        if (!providerId) return res.fail('`providerId` is required', 400);

        // Verify provider exists
        const provider = await Provider.findByPk(providerId);
        if (!provider) return res.fail('Provider not found', 404);

        // Check for duplicate code
        const existingCode = await Service.findOne({ where: { code } });
        if (existingCode) return res.fail('Service code already exists', 400);

        // Create service
        const service = await Service.create({
            name,
            code,
            description,
            requiresPreauthorization: requiresPreauthorization || false,
            price,
            providerId,
            status: status || 'pending'
        });

        await addAuditLog(req.models, {
            action: 'service.create',
            message: `Service ${service.name} created for Provider ${provider.name}`,
            userId: (req.user && req.user.id) ? req.user.id : null,
            userType: (req.user && req.user.type) ? req.user.type : null,
            meta: { serviceId: service.id, providerId }
        });

        return res.success({ service: service.toJSON() }, 'Service created', 201);
    } catch (err) {
        return next(err);
    }
}

async function updateService(req, res, next) {
    try {
        const { Service } = req.models;
        const { id } = req.params;
        const {
            name,
            code,
            description,
            requiresPreauthorization,
            price,
            status
        } = req.body || {};

        const service = await Service.findByPk(id);
        if (!service) return res.fail('Service not found', 404);

        const updates = {};

        if (name !== undefined) updates.name = name;
        if (description !== undefined) updates.description = description;
        if (requiresPreauthorization !== undefined) updates.requiresPreauthorization = requiresPreauthorization;
        if (price !== undefined) updates.price = price;
        if (status !== undefined) updates.status = status;

        // Handle code update with uniqueness check
        if (code !== undefined && code !== service.code) {
            const existingCode = await Service.findOne({ where: { code, id: { [Op.ne]: id } } });
            if (existingCode) return res.fail('Service code already exists', 400);
            updates.code = code;
        }

        await service.update(updates);

        await addAuditLog(req.models, {
            action: 'service.update',
            message: `Service ${service.name} updated`,
            userId: (req.user && req.user.id) ? req.user.id : null,
            userType: (req.user && req.user.type) ? req.user.type : null,
            meta: { serviceId: service.id }
        });

        return res.success({ service }, 'Service updated');
    } catch (err) {
        return next(err);
    }
}

async function deleteService(req, res, next) {
    try {
        const { Service } = req.models;
        const { id } = req.params;

        const service = await Service.findByPk(id);
        if (!service) return res.fail('Service not found', 404);

        await service.destroy();

        await addAuditLog(req.models, {
            action: 'service.delete',
            message: `Service ${service.name} deleted`,
            userId: (req.user && req.user.id) ? req.user.id : null,
            userType: (req.user && req.user.type) ? req.user.type : null,
            meta: { serviceId: id }
        });

        return res.success(null, 'Service deleted');
    } catch (err) {
        return next(err);
    }
}

async function listServices(req, res, next) {
    try {
        const { Service, Provider } = req.models;
        const { limit = 10, page = 1, q, providerId, status } = req.query;

        const isAll = String(limit).toLowerCase() === 'all';
        const limitNum = isAll ? 0 : Number(limit);
        const pageNum = isAll ? 1 : (Number(page) || 1);
        const offset = isAll ? 0 : (pageNum - 1) * limitNum;

        const where = {};

        if (q) {
            where[Op.or] = [
                { name: { [Op.iLike || Op.like]: `%${q}%` } },
                { code: { [Op.iLike || Op.like]: `%${q}%` } },
                { description: { [Op.iLike || Op.like]: `%${q}%` } }
            ];
        }

        if (providerId) where.providerId = providerId;
        if (status) where.status = status;

        const total = await Service.count({ where });

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

        const services = await Service.findAll(findOptions);
        const data = services.map(s => s.toJSON());

        const hasPrevPage = !isAll && pageNum > 1;
        const hasNextPage = !isAll && (offset + services.length < total);
        const totalPages = isAll ? 1 : (limitNum > 0 ? Math.ceil(total / limitNum) : 1);

        return res.success({ list: data, count: total, page: pageNum, limit: isAll ? 'all' : limitNum, totalPages, hasNextPage, hasPrevPage });
    } catch (err) {
        return next(err);
    }
}

async function getService(req, res, next) {
    try {
        const { Service, Provider } = req.models;
        const { id } = req.params;

        const service = await Service.findByPk(id, {
            include: [
                {
                    model: Provider,
                    attributes: ['id', 'name', 'code', 'email', 'phoneNumber']
                }
            ]
        });

        if (!service) return res.fail('Service not found', 404);

        return res.success(service.toJSON());
    } catch (err) {
        return next(err);
    }
}

module.exports = {
    createService,
    updateService,
    deleteService,
    listServices,
    getService
};
