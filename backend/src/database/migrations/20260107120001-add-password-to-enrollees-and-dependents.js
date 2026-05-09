'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        // Add password column to enrollees table
        await queryInterface.addColumn('enrollees', 'password', {
            type: Sequelize.STRING,
            allowNull: true,
            comment: 'Password for enrollee account'
        });

        // Add password column to enrollee_dependents table
        await queryInterface.addColumn('enrollee_dependents', 'password', {
            type: Sequelize.STRING,
            allowNull: true,
            comment: 'Password for dependent account'
        });
    },

    async down(queryInterface, Sequelize) {
        // Remove the password columns
        await queryInterface.removeColumn('enrollees', 'password');
        await queryInterface.removeColumn('enrollee_dependents', 'password');
    }
};
