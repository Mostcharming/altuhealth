'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.addColumn('company_plans', 'plan_type', {
            type: Sequelize.ENUM('standard', 'custom'),
            allowNull: false,
            defaultValue: 'custom'
        });

        // Make plan_id nullable since custom plans don't need it
        await queryInterface.changeColumn('company_plans', 'plan_id', {
            type: Sequelize.UUID,
            allowNull: true,
            references: {
                model: 'plans',
                key: 'id'
            },
            onUpdate: 'CASCADE',
            onDelete: 'RESTRICT'
        });
    },

    async down(queryInterface, Sequelize) {
        // Make plan_id required again
        await queryInterface.changeColumn('company_plans', 'plan_id', {
            type: Sequelize.UUID,
            allowNull: false,
            references: {
                model: 'plans',
                key: 'id'
            },
            onUpdate: 'CASCADE',
            onDelete: 'RESTRICT'
        });

        await queryInterface.removeColumn('company_plans', 'plan_type');
    }
};
