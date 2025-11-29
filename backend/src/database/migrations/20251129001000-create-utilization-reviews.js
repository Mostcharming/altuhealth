'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('utilization_reviews', {
            id: {
                type: Sequelize.UUID,
                allowNull: false,
                primaryKey: true,
                defaultValue: Sequelize.UUIDV4,
                field: 'id'
            },
            company_id: {
                type: Sequelize.UUID,
                allowNull: false,
                references: {
                    model: 'companies',
                    key: 'id'
                },
                field: 'company_id'
            },
            company_plan_id: {
                type: Sequelize.UUID,
                allowNull: false,
                references: {
                    model: 'company_plans',
                    key: 'id'
                },
                field: 'company_plan_id'
            },
            policy_period_start_date: {
                type: Sequelize.DATE,
                allowNull: false,
                field: 'policy_period_start_date'
            },
            policy_period_end_date: {
                type: Sequelize.DATE,
                allowNull: false,
                field: 'policy_period_end_date'
            },
            quarter: {
                type: Sequelize.ENUM('Q1', 'Q2', 'Q3', 'Q4'),
                allowNull: false,
                field: 'quarter'
            },
            total_enrollees: {
                type: Sequelize.INTEGER,
                allowNull: false,
                defaultValue: 0,
                field: 'total_enrollees'
            },
            total_dependents: {
                type: Sequelize.INTEGER,
                allowNull: false,
                defaultValue: 0,
                field: 'total_dependents'
            },
            total_claim_amount: {
                type: Sequelize.DECIMAL(15, 2),
                allowNull: false,
                defaultValue: 0.00,
                field: 'total_claim_amount'
            },
            utilization_rate: {
                type: Sequelize.DECIMAL(5, 2),
                allowNull: false,
                defaultValue: 0.00,
                field: 'utilization_rate',
                comment: 'Percentage (0-100)'
            },
            top_utilized_services: {
                type: Sequelize.JSON,
                allowNull: true,
                field: 'top_utilized_services',
                comment: 'Array of services with usage count'
            },
            top_providers: {
                type: Sequelize.JSON,
                allowNull: true,
                field: 'top_providers',
                comment: 'Array of providers with claim count'
            },
            excluded_service_attempts: {
                type: Sequelize.INTEGER,
                allowNull: false,
                defaultValue: 0,
                field: 'excluded_service_attempts'
            },
            status: {
                type: Sequelize.ENUM('draft', 'completed', 'pending_approval', 'approved'),
                allowNull: false,
                defaultValue: 'draft',
                field: 'status'
            },
            created_at: {
                type: Sequelize.DATE,
                allowNull: false,
                defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
                field: 'created_at'
            },
            updated_at: {
                type: Sequelize.DATE,
                allowNull: false,
                defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
                field: 'updated_at'
            }
        });

        // Add indexes for common queries
        await queryInterface.addIndex('utilization_reviews', ['company_id']);
        await queryInterface.addIndex('utilization_reviews', ['company_plan_id']);
        await queryInterface.addIndex('utilization_reviews', ['quarter']);
        await queryInterface.addIndex('utilization_reviews', ['status']);
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('utilization_reviews');
    }
};
