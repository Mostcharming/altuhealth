'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        // Check if the password column already exists in enrollee_dependents
        const table = await queryInterface.describeTable('enrollee_dependents');
        if (!table.password) {
            await queryInterface.addColumn('enrollee_dependents', 'password', {
                type: Sequelize.STRING,
                allowNull: true,
                after: 'notes'
            });
        }
    },

    async down(queryInterface, Sequelize) {
        const table = await queryInterface.describeTable('enrollee_dependents');
        if (table.password) {
            await queryInterface.removeColumn('enrollee_dependents', 'password');
        }
    }
};
