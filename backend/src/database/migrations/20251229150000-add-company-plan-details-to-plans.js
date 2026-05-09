'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.addColumn('plans', 'age_limit', {
            type: Sequelize.INTEGER,
            allowNull: true,
            comment: 'Age limit for plan members'
        });

        await queryInterface.addColumn('plans', 'dependent_age_limit', {
            type: Sequelize.INTEGER,
            allowNull: true,
            comment: 'Age limit for plan dependents'
        });

        await queryInterface.addColumn('plans', 'max_number_of_dependents', {
            type: Sequelize.INTEGER,
            allowNull: true,
            comment: 'Maximum number of dependents allowed per plan'
        });

        await queryInterface.addColumn('plans', 'discount_per_enrolee', {
            type: Sequelize.DECIMAL(10, 2),
            allowNull: true,
            comment: 'Discount per enrolee'
        });

        await queryInterface.addColumn('plans', 'plan_cycle', {
            type: Sequelize.STRING,
            allowNull: true,
            comment: 'e.g., monthly, quarterly, annual'
        });

        await queryInterface.addColumn('plans', 'annual_premium_price', {
            type: Sequelize.DECIMAL(10, 2),
            allowNull: true,
            comment: 'Annual premium price for the plan'
        });

        await queryInterface.addColumn('plans', 'allow_dependent_enrolee', {
            type: Sequelize.BOOLEAN,
            allowNull: false,
            defaultValue: true,
            comment: 'Whether the plan allows dependent enrollees'
        });
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.removeColumn('plans', 'age_limit');
        await queryInterface.removeColumn('plans', 'dependent_age_limit');
        await queryInterface.removeColumn('plans', 'max_number_of_dependents');
        await queryInterface.removeColumn('plans', 'discount_per_enrolee');
        await queryInterface.removeColumn('plans', 'plan_cycle');
        await queryInterface.removeColumn('plans', 'annual_premium_price');
        await queryInterface.removeColumn('plans', 'allow_dependent_enrolee');
    }
};
