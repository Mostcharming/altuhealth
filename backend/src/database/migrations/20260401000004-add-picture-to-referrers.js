'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.addColumn('referrers', 'picture', {
            type: Sequelize.STRING,
            allowNull: true,
            after: 'total_withdrawn'
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.removeColumn('referrers', 'picture');
    }
};
