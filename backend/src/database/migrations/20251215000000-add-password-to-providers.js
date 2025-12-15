'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        // Add password column to providers table
        await queryInterface.addColumn('providers', 'password', {
            type: Sequelize.STRING,
            allowNull: true,
            comment: 'Password for provider account'
        });
    },

    async down(queryInterface, Sequelize) {
        // Remove the password column
        await queryInterface.removeColumn('providers', 'password');
    }
};
