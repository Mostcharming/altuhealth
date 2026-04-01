'use strict';
const { v4: uuidv4 } = require('uuid');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        const now = new Date();

        await queryInterface.bulkInsert('referral_programs', [
            {
                id: uuidv4(),
                name: 'AltuHealth Referral Program',
                description: 'Earn rewards by referring friends and family to AltuHealth. Get paid for every successful referral.',
                status: 'active',
                reward_type: 'fixed',
                fixed_rate: 500.00,
                percentage_rate: null,
                cap_amount: null,
                minimum_payout: 1000.00,
                start_date: now,
                end_date: null,
                max_referrals_per_referrer: null,
                max_total_payout: null,
                is_deleted: false,
                created_at: now,
                updated_at: now
            }
        ], {});
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.bulkDelete('referral_programs', {
            name: 'AltuHealth Referral Program'
        }, {});
    }
};
