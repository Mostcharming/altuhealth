'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.addColumn('referral_programs', 'picture', {
            type: Sequelize.STRING,
            allowNull: true,
            after: 'max_total_payout'
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.removeColumn('referral_programs', 'picture');
    }
};
