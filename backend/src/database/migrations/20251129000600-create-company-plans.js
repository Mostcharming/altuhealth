'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('company_plans', {
            id: {
                type: Sequelize.UUID,
                allowNull: false,
                primaryKey: true,
                defaultValue: Sequelize.UUIDV4
            },
            company_id: {
                type: Sequelize.UUID,
                allowNull: false,
                references: {
                    model: 'companies',
                    key: 'id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE'
            },
            plan_type: {
                type: Sequelize.STRING,
                allowNull: false
            },
            name: {
                type: Sequelize.STRING,
                allowNull: false
            },
            age_limit: {
                type: Sequelize.INTEGER,
                allowNull: true
            },
            dependent_age_limit: {
                type: Sequelize.INTEGER,
                allowNull: true
            },
            max_number_of_dependents: {
                type: Sequelize.INTEGER,
                allowNull: true
            },
            discount_per_enrolee: {
                type: Sequelize.DECIMAL(10, 2),
                allowNull: true
            },
            plan_cycle: {
                type: Sequelize.STRING,
                allowNull: false,
                comment: 'e.g., monthly, quarterly, annual'
            },
            annual_premium_price: {
                type: Sequelize.DECIMAL(10, 2),
                allowNull: false
            },
            description: {
                type: Sequelize.TEXT,
                allowNull: true
            },
            allow_dependent_enrolee: {
                type: Sequelize.BOOLEAN,
                allowNull: false,
                defaultValue: true
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
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('company_plans');
    }
};
