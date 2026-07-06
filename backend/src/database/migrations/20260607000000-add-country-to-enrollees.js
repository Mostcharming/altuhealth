'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.addColumn('enrollees', 'country', {
            type: Sequelize.STRING,
            allowNull: true
        });
    },

    async down(queryInterface) {
        await queryInterface.removeColumn('enrollees', 'country');
    }
};
