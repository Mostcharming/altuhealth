'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.addColumn('providers', 'current_location', {
            type: Sequelize.STRING,
            allowNull: true
        });

        await queryInterface.addColumn('providers', 'latitude', {
            type: Sequelize.DECIMAL(10, 8),
            allowNull: true
        });

        await queryInterface.addColumn('providers', 'longitude', {
            type: Sequelize.DECIMAL(11, 8),
            allowNull: true
        });
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.removeColumn('providers', 'current_location');
        await queryInterface.removeColumn('providers', 'latitude');
        await queryInterface.removeColumn('providers', 'longitude');
    }
};
