'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        // Add columns to retail_enrollees table
        await queryInterface.addColumn('retail_enrollees', 'picture_url', {
            type: Sequelize.STRING,
            allowNull: true
        });

        await queryInterface.addColumn('retail_enrollees', 'id_card_url', {
            type: Sequelize.STRING,
            allowNull: true
        });

        // Add columns to retail_enrollee_dependents table
        await queryInterface.addColumn('retail_enrollee_dependents', 'picture_url', {
            type: Sequelize.STRING,
            allowNull: true
        });

        await queryInterface.addColumn('retail_enrollee_dependents', 'id_card_url', {
            type: Sequelize.STRING,
            allowNull: true
        });
    },

    async down(queryInterface, Sequelize) {
        // Remove columns from retail_enrollees table
        await queryInterface.removeColumn('retail_enrollees', 'picture_url');
        await queryInterface.removeColumn('retail_enrollees', 'id_card_url');

        // Remove columns from retail_enrollee_dependents table
        await queryInterface.removeColumn('retail_enrollee_dependents', 'picture_url');
        await queryInterface.removeColumn('retail_enrollee_dependents', 'id_card_url');
    }
};
