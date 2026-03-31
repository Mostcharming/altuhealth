'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        // Add password column to retail_enrollees table
        await queryInterface.addColumn('retail_enrollees', 'password', {
            type: Sequelize.STRING,
            allowNull: true,
            comment: 'Hashed password for retail enrollee login'
        });
    },

    down: async (queryInterface, Sequelize) => {
        // Remove password column from retail_enrollees table
        await queryInterface.removeColumn('retail_enrollees', 'password');
    }
};
