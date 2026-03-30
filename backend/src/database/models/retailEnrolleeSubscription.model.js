'use strict';

module.exports = (sequelize, DataTypes) => {
    const RetailEnrolleeSubscription = sequelize.define('RetailEnrolleeSubscription', {
        id: {
            type: DataTypes.UUID,
            allowNull: false,
            primaryKey: true,
            defaultValue: DataTypes.UUIDV4,
            field: 'id'
        },
        referenceNumber: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
            field: 'reference_number',
            comment: 'Unique subscription reference (e.g., RES-SUB-2026-001)'
        },
        retailEnrolleeId: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: 'retail_enrollees',
                key: 'id'
            },
            onUpdate: 'CASCADE',
            onDelete: 'CASCADE',
            field: 'retail_enrollee_id'
        },
        planId: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: 'plans',
                key: 'id'
            },
            onUpdate: 'CASCADE',
            onDelete: 'RESTRICT',
            field: 'plan_id',
            comment: 'The plan that was purchased'
        },
        planCycle: {
            type: DataTypes.ENUM('monthly', 'quarterly', 'semi_annual', 'annual'),
            allowNull: false,
            field: 'plan_cycle',
            comment: 'Plan billing cycle'
        },
        amountPaid: {
            type: DataTypes.DECIMAL(15, 2),
            allowNull: false,
            field: 'amount_paid',
            comment: 'Amount paid for this subscription'
        },
        currency: {
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: 'NGN',
            field: 'currency',
            comment: 'Currency code (e.g., NGN, USD)'
        },
        datePaid: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
            field: 'date_paid',
            comment: 'Date when the payment was made'
        },
        subscriptionStartDate: {
            type: DataTypes.DATE,
            allowNull: false,
            field: 'subscription_start_date',
            comment: 'Start date of the subscription coverage'
        },
        subscriptionEndDate: {
            type: DataTypes.DATE,
            allowNull: false,
            field: 'subscription_end_date',
            comment: 'End date of the subscription coverage'
        },
        paymentMethod: {
            type: DataTypes.ENUM('bank_transfer', 'cash', 'cheque', 'card', 'mobile_money', 'wallet', 'other'),
            allowNull: false,
            field: 'payment_method',
            comment: 'Method used for payment'
        },
        transactionReference: {
            type: DataTypes.STRING,
            allowNull: true,
            field: 'transaction_reference',
            comment: 'Bank transaction reference or receipt number'
        },
        paymentGatewayProvider: {
            type: DataTypes.STRING,
            allowNull: true,
            field: 'payment_gateway_provider',
            comment: 'Payment gateway used (e.g., Paystack, Flutterwave)'
        },
        paymentGatewayTransactionId: {
            type: DataTypes.STRING,
            allowNull: true,
            field: 'payment_gateway_transaction_id',
            comment: 'Transaction ID from payment gateway'
        },
        status: {
            type: DataTypes.ENUM('active', 'expired', 'cancelled', 'suspended'),
            allowNull: false,
            defaultValue: 'active',
            field: 'status',
            comment: 'Subscription status'
        },
        isRenewal: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
            field: 'is_renewal',
            comment: 'Indicates if this is a renewal of a previous subscription'
        },
        previousSubscriptionId: {
            type: DataTypes.UUID,
            allowNull: true,
            references: {
                model: 'retail_enrollee_subscriptions',
                key: 'id'
            },
            onUpdate: 'CASCADE',
            onDelete: 'SET NULL',
            field: 'previous_subscription_id',
            comment: 'Reference to the previous subscription if this is a renewal'
        },
        notes: {
            type: DataTypes.TEXT,
            allowNull: true,
            field: 'notes',
            comment: 'Additional notes or remarks about the subscription'
        }
    }, {
        tableName: 'retail_enrollee_subscriptions',
        timestamps: true,
        underscored: true,
        indexes: [
            {
                fields: ['retail_enrollee_id']
            },
            {
                fields: ['plan_id']
            },
            {
                fields: ['reference_number']
            },
            {
                fields: ['status']
            },
            {
                fields: ['subscription_start_date', 'subscription_end_date']
            },
            {
                fields: ['date_paid']
            }
        ]
    });

    return RetailEnrolleeSubscription;
};
