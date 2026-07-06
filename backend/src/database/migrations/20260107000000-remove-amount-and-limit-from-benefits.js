'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        // Remove amount and limit columns from benefits table
        await queryInterface.removeColumn('benefits', 'amount');
        await queryInterface.removeColumn('benefits', 'limit');
    },

    async down(queryInterface, Sequelize) {
        // Rollback: add columns back
        await queryInterface.addColumn('benefits', 'limit', {
            type: Sequelize.STRING,
            allowNull: true
        });
        await queryInterface.addColumn('benefits', 'amount', {
            type: Sequelize.DECIMAL(10, 2),
            allowNull: true
        });
    }
};
