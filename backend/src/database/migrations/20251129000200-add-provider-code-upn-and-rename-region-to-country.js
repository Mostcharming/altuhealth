'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        // Add new columns
        await queryInterface.addColumn('providers', 'code', {
            type: Sequelize.STRING,
            allowNull: false,
            unique: true,
            field: 'code'
        });

        await queryInterface.addColumn('providers', 'upn', {
            type: Sequelize.STRING,
            allowNull: false,
            unique: true,
            field: 'upn'
        });

        // Rename region to country
        await queryInterface.renameColumn('providers', 'region', 'country');

        // Update country column to be NOT NULL
        await queryInterface.changeColumn('providers', 'country', {
            type: Sequelize.STRING,
            allowNull: false,
            field: 'country'
        });

        // Add indexes for better query performance
        await queryInterface.addIndex('providers', ['code']);
        await queryInterface.addIndex('providers', ['upn']);
        await queryInterface.addIndex('providers', ['country']);
    },

    async down(queryInterface, Sequelize) {
        // Remove indexes
        await queryInterface.removeIndex('providers', ['code']);
        await queryInterface.removeIndex('providers', ['upn']);
        await queryInterface.removeIndex('providers', ['country']);

        // Revert country back to region
        await queryInterface.changeColumn('providers', 'country', {
            type: Sequelize.STRING,
            allowNull: true,
            field: 'region'
        });

        await queryInterface.renameColumn('providers', 'country', 'region');

        // Remove new columns
        await queryInterface.removeColumn('providers', 'upn');
        await queryInterface.removeColumn('providers', 'code');
    }
};
