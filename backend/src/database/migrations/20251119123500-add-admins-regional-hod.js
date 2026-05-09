'use strict';

/**
 * Migration: add is_regional_officer and is_hod to admins table
 */
module.exports = {
    up: async (queryInterface, Sequelize) => {
        return queryInterface.sequelize.transaction(async (transaction) => {
            await queryInterface.addColumn(
                'admins',
                'is_regional_officer',
                {
                    type: Sequelize.BOOLEAN,
                    allowNull: false,
                    defaultValue: false
                },
                { transaction }
            );

            await queryInterface.addColumn(
                'admins',
                'is_hod',
                {
                    type: Sequelize.BOOLEAN,
                    allowNull: false,
                    defaultValue: false
                },
                { transaction }
            );
        });
    },

    down: async (queryInterface /* , Sequelize */) => {
        return queryInterface.sequelize.transaction(async (transaction) => {
            // remove in reverse order
            await queryInterface.removeColumn('admins', 'is_hod', { transaction });
            await queryInterface.removeColumn('admins', 'is_regional_officer', { transaction });
        });
    }
};
