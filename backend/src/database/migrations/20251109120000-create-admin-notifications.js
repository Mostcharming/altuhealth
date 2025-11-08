'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        // Ensure uuid extension is available for uuid_generate_v4()
        await queryInterface.sequelize.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp";');

        await queryInterface.createTable('admin_notifications', {
            id: {
                type: Sequelize.UUID,
                allowNull: false,
                primaryKey: true,
                defaultValue: Sequelize.literal('uuid_generate_v4()'),
                field: 'id'
            },
            user_id: {
                type: Sequelize.UUID,
                allowNull: false,
                field: 'user_id'
            },
            title: {
                type: Sequelize.STRING,
                allowNull: false,
                field: 'title'
            },
            is_read: {
                type: Sequelize.BOOLEAN,
                allowNull: false,
                defaultValue: false,
                field: 'is_read'
            },
            click_url: {
                type: Sequelize.STRING,
                allowNull: true,
                field: 'click_url'
            },
            created_at: {
                allowNull: false,
                type: Sequelize.DATE,
                defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
                field: 'created_at'
            },
            updated_at: {
                allowNull: false,
                type: Sequelize.DATE,
                defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
                field: 'updated_at'
            }
        });
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.dropTable('admin_notifications');
    }
};
