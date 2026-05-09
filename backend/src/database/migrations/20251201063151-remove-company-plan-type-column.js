'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        // Remove the old plan_type column
        await queryInterface.removeColumn('company_plans', 'plan_type');
    },

    down: async (queryInterface, Sequelize) => {
        // Restore the plan_type column if migration is rolled back
        await queryInterface.addColumn('company_plans', 'plan_type', {
            type: Sequelize.STRING,
            allowNull: false,
            field: 'plan_type'
        });
    }
};
