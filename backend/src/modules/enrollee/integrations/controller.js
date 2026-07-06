'use strict';

async function getHealaConfig(req, res, next) {
    try {
        const { Integration } = req.models;

        const integration = await Integration.findOne({
            where: {
                name: 'Heala Staging',
                is_active: true,
                is_deleted: false
            }
        });

        if (!integration) return res.fail('Heala integration is not configured', 404);

        const config = integration.additional_config || {};

        return res.success({
            heala: {
                name: integration.name,
                webLink: integration.base_url,
                providerId: config.providerId || null,
                dashboardUrl: config.dashboardUrl || null,
                developerDocsUrl: config.developerDocsUrl || null,
                environment: config.environment || 'staging',
                launchMode: config.launchMode || 'popup'
            }
        }, 'Heala integration retrieved');
    } catch (error) {
        return next(error);
    }
}

module.exports = {
    getHealaConfig
};
