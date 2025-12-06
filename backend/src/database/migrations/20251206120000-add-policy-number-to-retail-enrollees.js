'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        // Add policy_number column to retail_enrollees table
        await queryInterface.addColumn('retail_enrollees', 'policy_number', {
            type: Sequelize.STRING,
            allowNull: false,
            unique: true,
            after: 'id',
            comment: 'Unique policy number for the retail enrollee'
        });

        // Add index on policy_number for faster queries
        await queryInterface.addIndex('retail_enrollees', ['policy_number']);
    },

    async down(queryInterface, Sequelize) {
        // Remove the policy_number column
        await queryInterface.removeColumn('retail_enrollees', 'policy_number');
    }
};
