'use strict';

module.exports = (sequelize, DataTypes) => {
    const ReferrerEarning = sequelize.define('ReferrerEarning', {
        id: {
            type: DataTypes.UUID,
            allowNull: false,
            primaryKey: true,
            defaultValue: DataTypes.UUIDV4,
            field: 'id'
        },
        referrerId: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: 'referrers',
                key: 'id'
            },
            onUpdate: 'CASCADE',
            onDelete: 'CASCADE',
            field: 'referrer_id',
            comment: 'The referrer who made the referral'
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
            field: 'retail_enrollee_id',
            comment: 'The retail enrollee who was referred'
        },
        retailEnrolleeSubscriptionId: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: 'retail_enrollee_subscriptions',
                key: 'id'
            },
            onUpdate: 'CASCADE',
            onDelete: 'CASCADE',
            field: 'retail_enrollee_subscription_id',
            comment: 'The subscription that generated the earning'
        },
        referralProgramId: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: 'referral_programs',
                key: 'id'
            },
            onUpdate: 'CASCADE',
            onDelete: 'RESTRICT',
            field: 'referral_program_id',
            comment: 'The referral program that was active at the time'
        },
        subscriptionAmount: {
            type: DataTypes.DECIMAL(15, 2),
            allowNull: false,
            field: 'subscription_amount',
            comment: 'Amount paid for the subscription'
        },
        rewardType: {
            type: DataTypes.ENUM('fixed', 'percentage'),
            allowNull: false,
            field: 'reward_type',
            comment: 'Type of reward (fixed amount or percentage)'
        },
        rewardRate: {
            type: DataTypes.DECIMAL(15, 2),
            allowNull: false,
            field: 'reward_rate',
            comment: 'The rate used (either fixed amount or percentage)'
        },
        earnedAmount: {
            type: DataTypes.DECIMAL(15, 2),
            allowNull: false,
            field: 'earned_amount',
            comment: 'The amount earned by the referrer'
        },
        currency: {
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: 'NGN',
            field: 'currency',
            comment: 'Currency code (e.g., NGN, USD)'
        },
        status: {
            type: DataTypes.ENUM('pending', 'confirmed', 'withdrawn'),
            allowNull: false,
            defaultValue: 'pending',
            field: 'status',
            comment: 'Status of the earning (pending confirmation, confirmed, or withdrawn)'
        },
        isWithdrawn: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
            field: 'is_withdrawn',
            comment: 'Whether this earning has been withdrawn'
        },
        withdrawnAt: {
            type: DataTypes.DATE,
            allowNull: true,
            field: 'withdrawn_at',
            comment: 'Date when the earning was withdrawn'
        },
        notes: {
            type: DataTypes.TEXT,
            allowNull: true,
            field: 'notes',
            comment: 'Additional notes about this earning'
        }
    }, {
        tableName: 'referrer_earnings',
        timestamps: true,
        underscored: true,
        indexes: [
            {
                fields: ['referrer_id']
            },
            {
                fields: ['retail_enrollee_id']
            },
            {
                fields: ['retail_enrollee_subscription_id']
            },
            {
                fields: ['referral_program_id']
            },
            {
                fields: ['status']
            },
            {
                fields: ['is_withdrawn']
            },
            {
                fields: ['created_at']
            }
        ]
    });

    return ReferrerEarning;
};
