'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        // Rename timestamps to snake_case to match model `field` mappings
        await Promise.all([
            queryInterface.renameColumn('general_settings', 'createdAt', 'created_at'),
            queryInterface.renameColumn('general_settings', 'updatedAt', 'updated_at')
        ]);
    },

    async down(queryInterface, Sequelize) {
        // Revert the column names back to camelCase
        await Promise.all([
            queryInterface.renameColumn('general_settings', 'created_at', 'createdAt'),
            queryInterface.renameColumn('general_settings', 'updated_at', 'updatedAt')
        ]);
    }
};
