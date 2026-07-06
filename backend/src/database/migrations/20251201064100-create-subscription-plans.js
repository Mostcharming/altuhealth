'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        // Create subscription_plans join table
        await queryInterface.createTable('subscription_plans', {
            id: {
                type: Sequelize.UUID,
                allowNull: false,
                primaryKey: true,
                defaultValue: Sequelize.UUIDV4
            },
            subscription_id: {
                type: Sequelize.UUID,
                allowNull: false,
                references: {
                    model: 'subscriptions',
                    key: 'id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE'
            },
            company_plan_id: {
                type: Sequelize.UUID,
                allowNull: false,
                references: {
                    model: 'company_plans',
                    key: 'id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE'
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
        await queryInterface.addIndex('subscription_plans', ['subscription_id']);
        await queryInterface.addIndex('subscription_plans', ['company_plan_id']);
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('subscription_plans');
    }
};
