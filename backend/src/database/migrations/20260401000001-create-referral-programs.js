'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('referral_programs', {
            id: {
                type: Sequelize.UUID,
                allowNull: false,
                primaryKey: true,
                defaultValue: Sequelize.UUIDV4
            },
            name: {
                type: Sequelize.STRING,
                allowNull: false
            },
            description: {
                type: Sequelize.TEXT,
                allowNull: true
            },
            status: {
                type: Sequelize.ENUM('active', 'inactive', 'paused'),
                allowNull: false,
                defaultValue: 'active'
            },
            reward_type: {
                type: Sequelize.ENUM('fixed', 'percentage'),
                allowNull: false,
                defaultValue: 'fixed'
            },
            fixed_rate: {
                type: Sequelize.DECIMAL(15, 2),
                allowNull: true
            },
            percentage_rate: {
                type: Sequelize.DECIMAL(5, 2),
                allowNull: true
            },
            cap_amount: {
                type: Sequelize.DECIMAL(15, 2),
                allowNull: true
            },
            minimum_payout: {
                type: Sequelize.DECIMAL(15, 2),
                allowNull: false,
                defaultValue: 0.00
            },
            start_date: {
                type: Sequelize.DATE,
                allowNull: false
            },
            end_date: {
                type: Sequelize.DATE,
                allowNull: true
            },
            max_referrals_per_referrer: {
                type: Sequelize.INTEGER,
                allowNull: true
            },
            max_total_payout: {
                type: Sequelize.DECIMAL(15, 2),
                allowNull: true
            },
            is_deleted: {
                type: Sequelize.BOOLEAN,
                allowNull: false,
                defaultValue: false
            },
            created_at: {
                type: Sequelize.DATE,
                allowNull: false,
                defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
            },
            updated_at: {
                type: Sequelize.DATE,
                allowNull: false,
                defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
            }
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('referral_programs');
    }
};
