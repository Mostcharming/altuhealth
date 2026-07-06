'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        // Add planId column as UUID
        await queryInterface.addColumn('company_plans', 'plan_id', {
            type: Sequelize.UUID,
            allowNull: true,
            references: {
                model: 'plans',
                key: 'id'
            },
            onUpdate: 'CASCADE',
            onDelete: 'SET NULL',
            field: 'plan_id'
        });
    },

    down: async (queryInterface, Sequelize) => {
        // Remove planId column
        await queryInterface.removeColumn('company_plans', 'plan_id');
    }
};
