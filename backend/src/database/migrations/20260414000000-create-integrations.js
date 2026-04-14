'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('integrations', {
            id: {
                type: Sequelize.UUID,
                allowNull: false,
                primaryKey: true,
                defaultValue: Sequelize.UUIDV4
            },
            name: {
                type: Sequelize.STRING,
                allowNull: false
            },
            description: {
                type: Sequelize.TEXT,
                allowNull: true
            },
            is_active: {
                type: Sequelize.BOOLEAN,
                allowNull: false,
                defaultValue: true
            },
            base_url: {
                type: Sequelize.STRING,
                allowNull: true
            },
            secret_key: {
                type: Sequelize.STRING,
                allowNull: true
            },
            public_key: {
                type: Sequelize.STRING,
                allowNull: true
            },
            api_key: {
                type: Sequelize.STRING,
                allowNull: true
            },
            api_secret: {
                type: Sequelize.STRING,
                allowNull: true
            },
            webhook_url: {
                type: Sequelize.STRING,
                allowNull: true
            },
            webhook_secret: {
                type: Sequelize.STRING,
                allowNull: true
            },
            additional_config: {
                type: Sequelize.JSON,
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
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('integrations');
    }
};
