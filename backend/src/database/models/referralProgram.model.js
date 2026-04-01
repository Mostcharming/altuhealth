'use strict';

module.exports = (sequelize, DataTypes) => {
    const ReferralProgram = sequelize.define('ReferralProgram', {
        id: {
            type: DataTypes.UUID,
            allowNull: false,
            primaryKey: true,
            defaultValue: DataTypes.UUIDV4,
            field: 'id'
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
            field: 'name'
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: true,
            field: 'description'
        },
        status: {
            type: DataTypes.ENUM('active', 'inactive', 'paused'),
            allowNull: false,
            defaultValue: 'active',
            field: 'status'
        },
        rewardType: {
            type: DataTypes.ENUM('fixed', 'percentage'),
            allowNull: false,
            defaultValue: 'fixed',
            field: 'reward_type'
        },
        fixedRate: {
            type: DataTypes.DECIMAL(15, 2),
            allowNull: true,
            field: 'fixed_rate'
        },
        percentageRate: {
            type: DataTypes.DECIMAL(5, 2),
            allowNull: true,
            field: 'percentage_rate'
        },
        capAmount: {
            type: DataTypes.DECIMAL(15, 2),
            allowNull: true,
            field: 'cap_amount'
        },
        minimumPayout: {
            type: DataTypes.DECIMAL(15, 2),
            allowNull: false,
            defaultValue: 0.00,
            field: 'minimum_payout'
        },
        startDate: {
            type: DataTypes.DATE,
            allowNull: false,
            field: 'start_date'
        },
        endDate: {
            type: DataTypes.DATE,
            allowNull: true,
            field: 'end_date'
        },
        maxReferralsPerReferrer: {
            type: DataTypes.INTEGER,
            allowNull: true,
            field: 'max_referrals_per_referrer'
        },
        maxTotalPayout: {
            type: DataTypes.DECIMAL(15, 2),
            allowNull: true,
            field: 'max_total_payout'
        },
        isDeleted: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
            field: 'is_deleted'
        }
    }, {
        tableName: 'referral_programs',
        timestamps: true,
        underscored: true
    });

    return ReferralProgram;
};
