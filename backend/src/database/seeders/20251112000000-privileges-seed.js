'use strict';
const { v4: uuidv4 } = require('uuid');

module.exports = {
    up: async (queryInterface, Sequelize) => {
        const now = new Date();

        // Define privileges (name should be unique)
        const privileges = [
            // Dashboard
            { id: uuidv4(), name: 'dashboard.overview.view', description: 'View dashboard overview', created_at: now, updated_at: now },
            { id: uuidv4(), name: 'dashboard.analytics.view', description: 'View analytics dashboard', created_at: now, updated_at: now },
            { id: uuidv4(), name: 'dashboard.kpis.view', description: 'View key metrics', created_at: now, updated_at: now },

            // Admins
            { id: uuidv4(), name: 'admins.directory.view', description: 'View admin directory', created_at: now, updated_at: now },
            { id: uuidv4(), name: 'admins.others.view', description: 'View other employees', created_at: now, updated_at: now },
            { id: uuidv4(), name: 'admins.roles.manage', description: 'Manage access & roles', created_at: now, updated_at: now },

            // Providers
            { id: uuidv4(), name: 'providers.directory.view', description: 'View provider directory', created_at: now, updated_at: now },
            { id: uuidv4(), name: 'providers.credentialing.manage', description: 'Manage provider credentialing', created_at: now, updated_at: now },
            { id: uuidv4(), name: 'providers.tariff.view', description: 'View tariff history', created_at: now, updated_at: now },
            { id: uuidv4(), name: 'providers.specializations.manage', description: 'Manage provider specializations', created_at: now, updated_at: now },

            // Organizations
            { id: uuidv4(), name: 'organizations.companies.view', description: 'View companies', created_at: now, updated_at: now },
            { id: uuidv4(), name: 'organizations.subscriptions.manage', description: 'Manage subscriptions & plans', created_at: now, updated_at: now },
            { id: uuidv4(), name: 'organizations.contracts.view', description: 'View contracts & SLAs', created_at: now, updated_at: now },
            { id: uuidv4(), name: 'organizations.reviews.view', description: 'View organization reviews', created_at: now, updated_at: now },

            // Enrollees
            { id: uuidv4(), name: 'enrollees.list.view', description: 'View enrollees list', created_at: now, updated_at: now },
            { id: uuidv4(), name: 'enrollees.dependents.view', description: 'View dependents', created_at: now, updated_at: now },
            { id: uuidv4(), name: 'enrollees.retail.view', description: 'View retail enrollees', created_at: now, updated_at: now },
            { id: uuidv4(), name: 'enrollees.form_setup.manage', description: 'Manage enrollee form setup', created_at: now, updated_at: now },
            { id: uuidv4(), name: 'enrollees.birthday_setup.manage', description: 'Manage birthday setup', created_at: now, updated_at: now },
            { id: uuidv4(), name: 'enrollees.bulk_upload.manage', description: 'Manage bulk upload of enrollees', created_at: now, updated_at: now },

            // Claims
            { id: uuidv4(), name: 'claims.management.view', description: 'View claims management', created_at: now, updated_at: now },
            { id: uuidv4(), name: 'claims.capture.manage', description: 'Manage capture & validation', created_at: now, updated_at: now },
            { id: uuidv4(), name: 'claims.vetting.manage', description: 'Manage vetting & adjudication', created_at: now, updated_at: now },
            { id: uuidv4(), name: 'claims.payment_batch.manage', description: 'Manage payment batches', created_at: now, updated_at: now },
            { id: uuidv4(), name: 'claims.payment_advice.view', description: 'View payment advice', created_at: now, updated_at: now },
            { id: uuidv4(), name: 'claims.reconciliation.view', description: 'View reconciliation', created_at: now, updated_at: now },
            { id: uuidv4(), name: 'claims.assigned.view', description: 'View assigned claims', created_at: now, updated_at: now },

            // Authorizations
            { id: uuidv4(), name: 'authorizations.requests.view', description: 'View authorization requests', created_at: now, updated_at: now },
            { id: uuidv4(), name: 'authorizations.tracker.view', description: 'View authorization tracker', created_at: now, updated_at: now },
            { id: uuidv4(), name: 'authorizations.create.manage', description: 'Create and manage authorizations', created_at: now, updated_at: now },
            { id: uuidv4(), name: 'authorizations.verification_monitor.view', description: 'View verification monitor', created_at: now, updated_at: now },

            // Services
            { id: uuidv4(), name: 'services.catalog.view', description: 'View service catalog', created_at: now, updated_at: now },
            { id: uuidv4(), name: 'services.call_memo.manage', description: 'Manage appointments & memos', created_at: now, updated_at: now },
            { id: uuidv4(), name: 'services.surveys.manage', description: 'Manage surveys', created_at: now, updated_at: now },
            { id: uuidv4(), name: 'services.service_cycles.manage', description: 'Manage service cycles', created_at: now, updated_at: now },

            // Billing
            { id: uuidv4(), name: 'billing.invoices.view', description: 'View invoices', created_at: now, updated_at: now },
            { id: uuidv4(), name: 'billing.generate_invoice.manage', description: 'Generate invoices', created_at: now, updated_at: now },
            { id: uuidv4(), name: 'billing.invoice_settings.manage', description: 'Manage billing settings', created_at: now, updated_at: now },
            { id: uuidv4(), name: 'billing.payment_reconciliation.view', description: 'View payment reconciliation', created_at: now, updated_at: now },

            // Configuration
            { id: uuidv4(), name: 'config.plans.manage', description: 'Manage plans', created_at: now, updated_at: now },
            { id: uuidv4(), name: 'config.units.manage', description: 'Manage units', created_at: now, updated_at: now },
            { id: uuidv4(), name: 'config.roles.manage', description: 'Manage roles', created_at: now, updated_at: now },
            { id: uuidv4(), name: 'config.diagnosis_codes.manage', description: 'Manage diagnosis codes', created_at: now, updated_at: now },
            { id: uuidv4(), name: 'config.exclusions.manage', description: 'Manage exclusions', created_at: now, updated_at: now },
            { id: uuidv4(), name: 'config.benefits.manage', description: 'Manage benefits', created_at: now, updated_at: now },
            { id: uuidv4(), name: 'config.notification_settings.manage', description: 'Manage notification settings', created_at: now, updated_at: now },
            { id: uuidv4(), name: 'config.integrations.manage', description: 'Manage integrations', created_at: now, updated_at: now },

            // Operations
            { id: uuidv4(), name: 'operations.approvals.manage', description: 'Manage approvals', created_at: now, updated_at: now },
            { id: uuidv4(), name: 'operations.requests.view', description: 'View operation requests', created_at: now, updated_at: now },
            { id: uuidv4(), name: 'operations.reports.view', description: 'View reports', created_at: now, updated_at: now },
            { id: uuidv4(), name: 'operations.system_status.view', description: 'View system status', created_at: now, updated_at: now },

            // Support
            { id: uuidv4(), name: 'support.tickets.manage', description: 'Manage support tickets', created_at: now, updated_at: now },
            { id: uuidv4(), name: 'support.ticket_replies.manage', description: 'Manage ticket replies', created_at: now, updated_at: now },
            { id: uuidv4(), name: 'support.knowledge_base.manage', description: 'Manage knowledge base', created_at: now, updated_at: now },
            { id: uuidv4(), name: 'support.sla_management.manage', description: 'Manage SLAs', created_at: now, updated_at: now },

            // Logs / Developer / Help
            { id: uuidv4(), name: 'logs.audit.view', description: 'View audit logs', created_at: now, updated_at: now },
            { id: uuidv4(), name: 'logs.notification.view', description: 'View notification logs', created_at: now, updated_at: now },
            { id: uuidv4(), name: 'developer.api_keys.manage', description: 'Manage API keys', created_at: now, updated_at: now },
            { id: uuidv4(), name: 'developer.webhooks.manage', description: 'Manage webhooks', created_at: now, updated_at: now },
        ];

        // Insert privileges
        await queryInterface.bulkInsert('privileges', privileges, {});

        // Optionally link all privileges to the initial super_admin role from initial seeder
        // Role id used in initial-seed: '22222222-2222-2222-2222-222222222222'
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
        // Remove role_privileges that were inserted by this seeder
        // We remove by role_id for the super role and by privilege names
        const privilegeNames = [
            'dashboard.overview.view', 'dashboard.analytics.view', 'dashboard.kpis.view',
            'admins.directory.view', 'admins.others.view', 'admins.roles.manage',
            'providers.directory.view', 'providers.credentialing.manage', 'providers.tariff.view', 'providers.specializations.manage',
            'organizations.companies.view', 'organizations.subscriptions.manage', 'organizations.contracts.view', 'organizations.reviews.view',
            'enrollees.list.view', 'enrollees.dependents.view', 'enrollees.retail.view', 'enrollees.form_setup.manage', 'enrollees.birthday_setup.manage', 'enrollees.bulk_upload.manage',
            'claims.management.view', 'claims.capture.manage', 'claims.vetting.manage', 'claims.payment_batch.manage', 'claims.payment_advice.view', 'claims.reconciliation.view', 'claims.assigned.view',
            'authorizations.requests.view', 'authorizations.tracker.view', 'authorizations.create.manage', 'authorizations.verification_monitor.view',
            'services.catalog.view', 'services.call_memo.manage', 'services.surveys.manage', 'services.service_cycles.manage',
            'billing.invoices.view', 'billing.generate_invoice.manage', 'billing.invoice_settings.manage', 'billing.payment_reconciliation.view',
            'config.plans.manage', 'config.units.manage', 'config.roles.manage', 'config.diagnosis_codes.manage', 'config.exclusions.manage', 'config.benefits.manage', 'config.notification_settings.manage', 'config.integrations.manage',
            'operations.approvals.manage', 'operations.requests.view', 'operations.reports.view', 'operations.system_status.view',
            'support.tickets.manage', 'support.ticket_replies.manage', 'support.knowledge_base.manage', 'support.sla_management.manage',
            'logs.audit.view', 'logs.notification.view', 'developer.api_keys.manage', 'developer.webhooks.manage'
        ];

        // Find privileges ids by name then delete role_privileges with those privilege_ids
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
