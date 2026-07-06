'use strict';
const { v4: uuidv4 } = require('uuid');

module.exports = {
    up: async (queryInterface, Sequelize) => {
        const now = new Date();

        const privileges = [
            { id: uuidv4(), name: 'admins.manage', description: 'Manage admin users & roles', created_at: now, updated_at: now },
            { id: uuidv4(), name: 'providers.manage', description: 'Manage providers', created_at: now, updated_at: now },
            { id: uuidv4(), name: 'organizations.manage', description: 'Manage organizations & companies', created_at: now, updated_at: now },
            { id: uuidv4(), name: 'enrollees.manage', description: 'Manage enrollees and dependents', created_at: now, updated_at: now },
            { id: uuidv4(), name: 'claims.manage', description: 'Manage claims lifecycle', created_at: now, updated_at: now },
            { id: uuidv4(), name: 'authorizations.manage', description: 'Manage authorization requests and trackers', created_at: now, updated_at: now },
            { id: uuidv4(), name: 'services.manage', description: 'Manage service catalog and cycles', created_at: now, updated_at: now },
            { id: uuidv4(), name: 'billing.manage', description: 'Manage billing and invoices', created_at: now, updated_at: now },
            { id: uuidv4(), name: 'config.manage', description: 'Manage configuration settings', created_at: now, updated_at: now },
            { id: uuidv4(), name: 'operations.manage', description: 'Manage operational approvals & reports', created_at: now, updated_at: now },
            { id: uuidv4(), name: 'support.manage', description: 'Manage support tickets & knowledge base', created_at: now, updated_at: now },
            { id: uuidv4(), name: 'logs.view', description: 'View system and audit logs', created_at: now, updated_at: now },
            { id: uuidv4(), name: 'developer.manage', description: 'Manage developer tools (API keys & webhooks)', created_at: now, updated_at: now },
        ];

        // Insert privileges
        await queryInterface.bulkInsert('privileges', privileges, {});

        const superRoleId = '22222222-2222-2222-2222-222222222222';

        const rolePrivileges = privileges.map(p => ({
            id: uuidv4(),
            role_id: superRoleId,
            privilege_id: p.id,
            created_at: now,
            updated_at: now
        }));

        await queryInterface.bulkInsert('role_privileges', rolePrivileges, {});
    },

    down: async (queryInterface, Sequelize) => {
        const privilegeNames = [
            'admins.manage', 'providers.manage', 'organizations.manage', 'enrollees.manage', 'claims.manage', 'authorizations.manage', 'services.manage', 'billing.manage', 'config.manage', 'operations.manage', 'support.manage', 'logs.view', 'developer.manage',
        ];

        const privileges = await queryInterface.sequelize.query(
            `SELECT id FROM privileges WHERE name IN (:names)`,
            {
                replacements: { names: privilegeNames },
                type: queryInterface.sequelize.QueryTypes.SELECT
            }
        );

        const privilegeIds = privileges.map(p => p.id);

        if (privilegeIds.length > 0) {
            await queryInterface.bulkDelete('role_privileges', { privilege_id: privilegeIds }, {});
        }

        await queryInterface.bulkDelete('privileges', { name: privilegeNames }, {});
    }
};
