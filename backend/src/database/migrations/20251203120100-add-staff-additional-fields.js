'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        // Add new columns to staffs table
        await queryInterface.addColumn('staffs', 'middle_name', {
            type: Sequelize.STRING,
            allowNull: true
        });

        await queryInterface.addColumn('staffs', 'date_of_birth', {
            type: Sequelize.DATE,
            allowNull: true
        });

        await queryInterface.addColumn('staffs', 'max_dependents', {
            type: Sequelize.INTEGER,
            allowNull: true
        });

        await queryInterface.addColumn('staffs', 'preexisting_medical_records', {
            type: Sequelize.TEXT,
            allowNull: true
        });

        await queryInterface.addColumn('staffs', 'company_plan_id', {
            type: Sequelize.UUID,
            allowNull: true,
            references: {
                model: 'company_plans',
                key: 'id'
            },
            onUpdate: 'CASCADE',
            onDelete: 'SET NULL'
        });

        // Add index on company_plan_id
        await queryInterface.addIndex('staffs', ['company_plan_id']);
    },

    async down(queryInterface, Sequelize) {
        // Remove the columns
        await queryInterface.removeColumn('staffs', 'middle_name');
        await queryInterface.removeColumn('staffs', 'date_of_birth');
        await queryInterface.removeColumn('staffs', 'max_dependents');
        await queryInterface.removeColumn('staffs', 'preexisting_medical_records');
        await queryInterface.removeColumn('staffs', 'company_plan_id');
    }
};
