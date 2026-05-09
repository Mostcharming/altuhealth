'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('company_plan_providers', {
            id: {
                type: Sequelize.UUID,
                allowNull: false,
                primaryKey: true,
                defaultValue: Sequelize.UUIDV4
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
            provider_id: {
                type: Sequelize.UUID,
                allowNull: false,
                references: {
                    model: 'providers',
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

        // Add composite unique index to prevent duplicates
        await queryInterface.addIndex('company_plan_providers', ['company_plan_id', 'provider_id'], {
            unique: true
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('company_plan_providers');
    }
};
