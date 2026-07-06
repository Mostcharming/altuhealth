'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.addColumn('retail_enrollees', 'referral_code', {
            type: Sequelize.STRING,
            allowNull: true,
            after: 'password'
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.removeColumn('retail_enrollees', 'referral_code');
    }
};
