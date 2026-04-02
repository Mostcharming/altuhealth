'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('referrer_earnings', {
            id: {
                type: Sequelize.UUID,
                allowNull: false,
                primaryKey: true,
                defaultValue: Sequelize.UUIDV4
            },
            referrer_id: {
                type: Sequelize.UUID,
                allowNull: false,
                references: {
                    model: 'referrers',
                    key: 'id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE'
            },
            retail_enrollee_id: {
                type: Sequelize.UUID,
                allowNull: false,
                references: {
                    model: 'retail_enrollees',
                    key: 'id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE'
            },
            retail_enrollee_subscription_id: {
                type: Sequelize.UUID,
                allowNull: false,
                references: {
                    model: 'retail_enrollee_subscriptions',
                    key: 'id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE'
            },
            referral_program_id: {
                type: Sequelize.UUID,
                allowNull: false,
                references: {
                    model: 'referral_programs',
                    key: 'id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'RESTRICT'
            },
            subscription_amount: {
                type: Sequelize.DECIMAL(15, 2),
                allowNull: false
            },
            reward_type: {
                type: Sequelize.ENUM('fixed', 'percentage'),
                allowNull: false
            },
            reward_rate: {
                type: Sequelize.DECIMAL(15, 2),
                allowNull: false
            },
            earned_amount: {
                type: Sequelize.DECIMAL(15, 2),
                allowNull: false
            },
            currency: {
                type: Sequelize.STRING,
                allowNull: false,
                defaultValue: 'NGN'
            },
            status: {
                type: Sequelize.ENUM('pending', 'confirmed', 'withdrawn'),
                allowNull: false,
                defaultValue: 'pending'
            },
            is_withdrawn: {
                type: Sequelize.BOOLEAN,
                allowNull: false,
                defaultValue: false
            },
            withdrawn_at: {
                type: Sequelize.DATE,
                allowNull: true
            },
            notes: {
                type: Sequelize.TEXT,
                allowNull: true
            },
            created_at: {
                type: Sequelize.DATE,
                allowNull: false,
                defaultValue: Sequelize.NOW
            },
            updated_at: {
                type: Sequelize.DATE,
                allowNull: false,
                defaultValue: Sequelize.NOW
            }
        });

        // Add indexes
        await queryInterface.addIndex('referrer_earnings', ['referrer_id']);
        await queryInterface.addIndex('referrer_earnings', ['retail_enrollee_id']);
        await queryInterface.addIndex('referrer_earnings', ['retail_enrollee_subscription_id']);
        await queryInterface.addIndex('referrer_earnings', ['referral_program_id']);
        await queryInterface.addIndex('referrer_earnings', ['status']);
        await queryInterface.addIndex('referrer_earnings', ['is_withdrawn']);
        await queryInterface.addIndex('referrer_earnings', ['created_at']);
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('referrer_earnings');
    }
};
