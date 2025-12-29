'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        // Make amount nullable
        await queryInterface.changeColumn('benefits', 'amount', {
            type: Sequelize.DECIMAL(10, 2),
            allowNull: true
        });

        // Add new coverage fields
        await queryInterface.addColumn('benefits', 'is_covered', {
            type: Sequelize.BOOLEAN,
            allowNull: false,
            defaultValue: false
        });

        await queryInterface.addColumn('benefits', 'coverage_type', {
            type: Sequelize.ENUM('times_per_year', 'times_per_month', 'quarterly', 'unlimited', 'amount_based', 'limit_based'),
            allowNull: true
        });

        await queryInterface.addColumn('benefits', 'coverage_value', {
            type: Sequelize.STRING,
            allowNull: true
        });
    },

    async down(queryInterface, Sequelize) {
        // Remove new columns
        await queryInterface.removeColumn('benefits', 'coverage_value');
        await queryInterface.removeColumn('benefits', 'coverage_type');
        await queryInterface.removeColumn('benefits', 'is_covered');

        // Revert amount to not nullable
        await queryInterface.changeColumn('benefits', 'amount', {
            type: Sequelize.DECIMAL(10, 2),
            allowNull: false
        });
    }
};
