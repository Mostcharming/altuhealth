'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.createTable('retail_enrollee_subscriptions', {
            id: {
                type: Sequelize.UUID,
                allowNull: false,
                primaryKey: true,
                defaultValue: Sequelize.UUIDV4
            },
            reference_number: {
                type: Sequelize.STRING,
                allowNull: false,
                unique: true,
                comment: 'Unique subscription reference (e.g., RES-SUB-2026-001)'
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
            plan_id: {
                type: Sequelize.UUID,
                allowNull: false,
                references: {
                    model: 'plans',
                    key: 'id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'RESTRICT',
                comment: 'The plan that was purchased'
            },
            plan_cycle: {
                type: Sequelize.ENUM('monthly', 'quarterly', 'semi_annual', 'annual'),
                allowNull: false,
                comment: 'Plan billing cycle'
            },
            amount_paid: {
                type: Sequelize.DECIMAL(15, 2),
                allowNull: false,
                comment: 'Amount paid for this subscription'
            },
            currency: {
                type: Sequelize.STRING,
                allowNull: false,
                defaultValue: 'NGN',
                comment: 'Currency code (e.g., NGN, USD)'
            },
            date_paid: {
                type: Sequelize.DATE,
                allowNull: false,
                defaultValue: Sequelize.NOW,
                comment: 'Date when the payment was made'
            },
            subscription_start_date: {
                type: Sequelize.DATE,
                allowNull: false,
                comment: 'Start date of the subscription coverage'
            },
            subscription_end_date: {
                type: Sequelize.DATE,
                allowNull: false,
                comment: 'End date of the subscription coverage'
            },
            payment_method: {
                type: Sequelize.ENUM('bank_transfer', 'cash', 'cheque', 'card', 'mobile_money', 'wallet', 'other'),
                allowNull: false,
                comment: 'Method used for payment'
            },
            transaction_reference: {
                type: Sequelize.STRING,
                allowNull: true,
                comment: 'Bank transaction reference or receipt number'
            },
            payment_gateway_provider: {
                type: Sequelize.STRING,
                allowNull: true,
                comment: 'Payment gateway used (e.g., Paystack, Flutterwave)'
            },
            payment_gateway_transaction_id: {
                type: Sequelize.STRING,
                allowNull: true,
                comment: 'Transaction ID from payment gateway'
            },
            status: {
                type: Sequelize.ENUM('active', 'expired', 'cancelled', 'suspended'),
                allowNull: false,
                defaultValue: 'active',
                comment: 'Subscription status'
            },
            is_renewal: {
                type: Sequelize.BOOLEAN,
                allowNull: false,
                defaultValue: false,
                comment: 'Indicates if this is a renewal of a previous subscription'
            },
            previous_subscription_id: {
                type: Sequelize.UUID,
                allowNull: true,
                references: {
                    model: 'retail_enrollee_subscriptions',
                    key: 'id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'SET NULL',
                comment: 'Reference to the previous subscription if this is a renewal'
            },
            notes: {
                type: Sequelize.TEXT,
                allowNull: true,
                comment: 'Additional notes or remarks about the subscription'
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
        await queryInterface.addIndex('retail_enrollee_subscriptions', ['retail_enrollee_id']);
        await queryInterface.addIndex('retail_enrollee_subscriptions', ['plan_id']);
        await queryInterface.addIndex('retail_enrollee_subscriptions', ['reference_number']);
        await queryInterface.addIndex('retail_enrollee_subscriptions', ['status']);
        await queryInterface.addIndex('retail_enrollee_subscriptions', ['subscription_start_date', 'subscription_end_date']);
        await queryInterface.addIndex('retail_enrollee_subscriptions', ['date_paid']);
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.dropTable('retail_enrollee_subscriptions');
    }
};
