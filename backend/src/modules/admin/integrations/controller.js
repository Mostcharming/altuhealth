'use strict';

const { Op } = require('sequelize');
const { addAuditLog } = require('../../../utils/addAdminNotification');

async function createIntegration(req, res, next) {
    try {
        const { Integration } = req.models;
        const { name, description, base_url, secret_key, public_key, api_key, api_secret, webhook_url, webhook_secret, additional_config } = req.body || {};

        if (!name) return res.fail('`name` is required', 400);

        // Check if integration with same name already exists
        const existingIntegration = await Integration.findOne({ where: { name } });
        if (existingIntegration) return res.fail('Integration with this name already exists', 400);

        const integration = await Integration.create({
            name,
            description,
            base_url,
            secret_key,
            public_key,
            api_key,
            api_secret,
            webhook_url,
            webhook_secret,
            additional_config,
            is_active: true
        });

        await addAuditLog(req.models, {
            action: 'integration.create',
            message: `Integration ${integration.name} created`,
            userId: (req.user && req.user.id) ? req.user.id : null,
            userType: (req.user && req.user.type) ? req.user.type : null,
            meta: { integrationId: integration.id }
        });

        return res.success({ integration: integration.toJSON() }, 'Integration created', 201);
    } catch (err) {
        return next(err);
    }
}

async function updateIntegration(req, res, next) {
    try {
        const { Integration } = req.models;
        const { id } = req.params;
        const { name, description, base_url, secret_key, public_key, api_key, api_secret, webhook_url, webhook_secret, additional_config, is_active } = req.body || {};

        const integration = await Integration.findByPk(id);
        if (!integration) return res.fail('Integration not found', 404);

        const updates = {};
        if (name !== undefined) {
            // Check if name is unique (exclude current record)
            const other = await Integration.findOne({
                where: { name, id: { [Op.ne]: id } }
            });
            if (other) return res.fail('Integration with this name already exists', 400);
            updates.name = name;
        }
        if (description !== undefined) updates.description = description;
        if (base_url !== undefined) updates.base_url = base_url;
        if (secret_key !== undefined) updates.secret_key = secret_key;
        if (public_key !== undefined) updates.public_key = public_key;
        if (api_key !== undefined) updates.api_key = api_key;
        if (api_secret !== undefined) updates.api_secret = api_secret;
        if (webhook_url !== undefined) updates.webhook_url = webhook_url;
        if (webhook_secret !== undefined) updates.webhook_secret = webhook_secret;
        if (additional_config !== undefined) updates.additional_config = additional_config;
        if (is_active !== undefined) updates.is_active = is_active;

        await integration.update(updates);

        await addAuditLog(req.models, {
            action: 'integration.update',
            message: `Integration ${integration.name} updated`,
            userId: (req.user && req.user.id) ? req.user.id : null,
            userType: (req.user && req.user.type) ? req.user.type : null,
            meta: { integrationId: integration.id }
        });

        return res.success({ integration }, 'Integration updated');
    } catch (err) {
        return next(err);
    }
}

async function deleteIntegration(req, res, next) {
    try {
        const { Integration } = req.models;
        const { id } = req.params;

        const integration = await Integration.findByPk(id);
        if (!integration) return res.fail('Integration not found', 404);

        await integration.destroy();

        await addAuditLog(req.models, {
            action: 'integration.delete',
            message: `Integration ${integration.name} deleted`,
            userId: (req.user && req.user.id) ? req.user.id : null,
            userType: (req.user && req.user.type) ? req.user.type : null,
            meta: { integrationId: id }
        });

        return res.success(null, 'Integration deleted');
    } catch (err) {
        return next(err);
    }
}

async function listIntegrations(req, res, next) {
    try {
        const { Integration } = req.models;
        const { limit = 10, page = 1, q, is_active } = req.query;

        const offset = (page - 1) * limit;

        const whereClause = {};
        if (is_active !== undefined) {
            whereClause.is_active = is_active === 'true';
        }

        if (q) {
            whereClause[Op.or] = [
                { name: { [Op.iLike]: `%${q}%` } },
                { description: { [Op.iLike]: `%${q}%` } }
            ];
        }

        const { count, rows } = await Integration.findAndCountAll({
            where: whereClause,
            limit: parseInt(limit),
            offset: parseInt(offset),
            order: [['created_at', 'DESC']]
        });

        return res.success({
            integrations: rows.map(i => i.toJSON()),
            pagination: {
                total: count,
                page: parseInt(page),
                pages: Math.ceil(count / limit)
            }
        }, 'Integrations retrieved');
    } catch (err) {
        return next(err);
    }
}

async function getIntegration(req, res, next) {
    try {
        const { Integration } = req.models;
        const { id } = req.params;

        const integration = await Integration.findByPk(id);
        if (!integration) return res.fail('Integration not found', 404);

        return res.success({ integration: integration.toJSON() }, 'Integration retrieved');
    } catch (err) {
        return next(err);
    }
}

async function toggleIntegrationStatus(req, res, next) {
    try {
        const { Integration } = req.models;
        const { id } = req.params;
        const { is_active } = req.body || {};

        if (is_active === undefined) return res.fail('`is_active` is required', 400);

        const integration = await Integration.findByPk(id);
        if (!integration) return res.fail('Integration not found', 404);

        await integration.update({ is_active });

        await addAuditLog(req.models, {
            action: 'integration.toggle',
            message: `Integration ${integration.name} status changed to ${is_active ? 'active' : 'inactive'}`,
            userId: (req.user && req.user.id) ? req.user.id : null,
            userType: (req.user && req.user.type) ? req.user.type : null,
            meta: { integrationId: integration.id }
        });

        return res.success({ integration }, 'Integration status updated');
    } catch (err) {
        return next(err);
    }
}

module.exports = {
    createIntegration,
    updateIntegration,
    deleteIntegration,
    listIntegrations,
    getIntegration,
    toggleIntegrationStatus
};
