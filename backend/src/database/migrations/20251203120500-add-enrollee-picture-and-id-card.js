'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        // Add new columns to enrollees table for picture and ID card
        await queryInterface.addColumn('enrollees', 'picture_url', {
            type: Sequelize.STRING,
            allowNull: true
        });

        await queryInterface.addColumn('enrollees', 'id_card_url', {
            type: Sequelize.STRING,
            allowNull: true
        });

        // Add indexes for faster lookups
        await queryInterface.addIndex('enrollees', ['picture_url']);
        await queryInterface.addIndex('enrollees', ['id_card_url']);
    },

    async down(queryInterface, Sequelize) {
        // Remove the columns
        await queryInterface.removeColumn('enrollees', 'picture_url');
        await queryInterface.removeColumn('enrollees', 'id_card_url');
    }
};
