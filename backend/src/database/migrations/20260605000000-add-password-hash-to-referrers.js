'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.addColumn('referrers', 'password_hash', {
            type: Sequelize.STRING,
            allowNull: true
        });
    },

    async down(queryInterface) {
        await queryInterface.removeColumn('referrers', 'password_hash');
    }
};
