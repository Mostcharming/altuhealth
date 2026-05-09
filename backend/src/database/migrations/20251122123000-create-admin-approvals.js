'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('admin_approvals', {
            id: {
                type: Sequelize.UUID,
                allowNull: false,
                primaryKey: true,
                defaultValue: Sequelize.UUIDV4
            },
            model: {
                type: Sequelize.STRING,
                allowNull: false
            },
            model_id: {
                type: Sequelize.UUID,
                allowNull: false
            },
            action: {
                type: Sequelize.ENUM('create', 'update', 'delete', 'other'),
                allowNull: false,
                defaultValue: 'other'
            },
            details: {
                type: Sequelize.JSON,
                allowNull: true
            },
            status: {
                type: Sequelize.ENUM('pending', 'approved', 'declined'),
                allowNull: false,
                defaultValue: 'pending'
            },
            requested_by: {
                type: Sequelize.UUID,
                allowNull: false
            },
            requested_by_type: {
                type: Sequelize.STRING,
                allowNull: true,
                defaultValue: 'Admin'
            },
            actioned_by: {
                type: Sequelize.UUID,
                allowNull: true
            },
            actioned_by_type: {
                type: Sequelize.STRING,
                allowNull: true
            },
            comments: {
                type: Sequelize.TEXT,
                allowNull: true
            },
            meta: {
                type: Sequelize.JSON,
                allowNull: true
            },
            due_at: {
                type: Sequelize.DATE,
                allowNull: true
            },
            is_deleted: {
                type: Sequelize.BOOLEAN,
                allowNull: false,
                defaultValue: false
            },
            created_at: {
                type: Sequelize.DATE,
                allowNull: false,
                defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
            },
            updated_at: {
                type: Sequelize.DATE,
                allowNull: false,
                defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
            }
        });

        // Add indexes for common queries
        await queryInterface.addIndex('admin_approvals', ['model', 'model_id']);
        await queryInterface.addIndex('admin_approvals', ['status']);
        await queryInterface.addIndex('admin_approvals', ['requested_by']);
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('admin_approvals');

        // Drop ENUM types for Postgres
        if (queryInterface.sequelize.getDialect() === 'postgres') {
            await queryInterface.sequelize.query("DROP TYPE IF EXISTS \"enum_admin_approvals_action\";");
            await queryInterface.sequelize.query("DROP TYPE IF EXISTS \"enum_admin_approvals_status\"");
        }
    }
};
