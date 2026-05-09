'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('provider_plans', {
            id: {
                type: Sequelize.UUID,
                allowNull: false,
                primaryKey: true,
                defaultValue: Sequelize.UUIDV4,
                field: 'id'
            },
            provider_id: {
                type: Sequelize.UUID,
                allowNull: false,
                references: {
                    model: 'providers',
                    key: 'id'
                },
                field: 'provider_id'
            },
            plan_id: {
                type: Sequelize.UUID,
                allowNull: false,
                references: {
                    model: 'plans',
                    key: 'id'
                },
                field: 'plan_id'
            },
            created_at: {
                type: Sequelize.DATE,
                allowNull: false,
                field: 'created_at'
            },
            updated_at: {
                type: Sequelize.DATE,
                allowNull: false,
                field: 'updated_at'
            }
        });

        // Add composite unique constraint to prevent duplicate provider-plan combinations
        await queryInterface.addConstraint('provider_plans', {
            fields: ['provider_id', 'plan_id'],
            type: 'unique',
            name: 'unique_provider_plan'
        });

        // Add indexes
        await queryInterface.addIndex('provider_plans', ['provider_id']);
        await queryInterface.addIndex('provider_plans', ['plan_id']);
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('provider_plans');
    }
};
