'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        // Make user_id nullable
        await queryInterface.changeColumn('admin_notifications', 'user_id', {
            type: Sequelize.UUID,
            allowNull: true,
            field: 'user_id'
        });
    },

    down: async (queryInterface, Sequelize) => {
        // Revert: make user_id NOT NULL
        await queryInterface.changeColumn('admin_notifications', 'user_id', {
            type: Sequelize.UUID,
            allowNull: false,
            field: 'user_id'
        });
    }
};
