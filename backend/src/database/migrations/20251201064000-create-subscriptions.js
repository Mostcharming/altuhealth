'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        // Create subscriptions table
        await queryInterface.createTable('subscriptions', {
            id: {
                type: Sequelize.UUID,
                allowNull: false,
                primaryKey: true,
                defaultValue: Sequelize.UUIDV4
            },
            code: {
                type: Sequelize.STRING,
                allowNull: false,
                unique: true
            },
            company_id: {
                type: Sequelize.UUID,
                allowNull: false,
                references: {
                    model: 'companies',
                    key: 'id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'RESTRICT'
            },
            mode: {
                type: Sequelize.ENUM('parent_only', 'parent_and_subsidiaries'),
                allowNull: false,
                defaultValue: 'parent_only'
            },
            subsidiary_id: {
                type: Sequelize.UUID,
                allowNull: true,
                references: {
                    model: 'company_subsidiaries',
                    key: 'id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'SET NULL'
            },
            start_date: {
                type: Sequelize.DATE,
                allowNull: false
            },
            end_date: {
                type: Sequelize.DATE,
                allowNull: false
            },
            notes: {
                type: Sequelize.TEXT,
                allowNull: true
            },
            is_active: {
                type: Sequelize.BOOLEAN,
                allowNull: false,
                defaultValue: true
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

        // Add indexes
        await queryInterface.addIndex('subscriptions', ['company_id']);
        await queryInterface.addIndex('subscriptions', ['code']);
        await queryInterface.addIndex('subscriptions', ['subsidiary_id']);
        await queryInterface.addIndex('subscriptions', ['start_date', 'end_date']);
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('subscriptions');

        // Drop ENUM type for Postgres
        if (queryInterface.sequelize.getDialect() === 'postgres') {
            await queryInterface.sequelize.query("DROP TYPE IF EXISTS \"enum_subscriptions_mode\";");
        }
    }
};
