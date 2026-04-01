'use strict';

module.exports = (sequelize, DataTypes) => {
    const Referrer = sequelize.define('Referrer', {
        id: {
            type: DataTypes.UUID,
            allowNull: false,
            primaryKey: true,
            defaultValue: DataTypes.UUIDV4,
            field: 'id'
        },
        firstName: {
            type: DataTypes.STRING,
            allowNull: false,
            field: 'first_name'
        },
        lastName: {
            type: DataTypes.STRING,
            allowNull: false,
            field: 'last_name'
        },
        phoneNumber: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
            field: 'phone_number'
        },
        email: {
            type: DataTypes.STRING,
            allowNull: true,
            unique: true,
            validate: {
                isEmail: true
            },
            field: 'email'
        },
        referralCode: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
            field: 'referral_code'
        },
        status: {
            type: DataTypes.ENUM('active', 'inactive', 'suspended'),
            allowNull: false,
            defaultValue: 'active',
            field: 'status'
        },
        bankName: {
            type: DataTypes.STRING,
            allowNull: true,
            field: 'bank_name'
        },
        accountName: {
            type: DataTypes.STRING,
            allowNull: true,
            field: 'account_name'
        },
        accountNumber: {
            type: DataTypes.STRING,
            allowNull: true,
            unique: true,
            field: 'account_number'
        },
        totalEarning: {
            type: DataTypes.DECIMAL(15, 2),
            allowNull: false,
            defaultValue: 0.00,
            field: 'total_earning'
        },
        availableBalance: {
            type: DataTypes.DECIMAL(15, 2),
            allowNull: false,
            defaultValue: 0.00,
            field: 'available_balance'
        },
        totalWithdrawn: {
            type: DataTypes.DECIMAL(15, 2),
            allowNull: false,
            defaultValue: 0.00,
            field: 'total_withdrawn'
        },
        picture: {
            type: DataTypes.STRING,
            allowNull: true,
            field: 'picture'
        },
        isDeleted: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
            field: 'is_deleted'
        }
    }, {
        tableName: 'referrers',
        timestamps: true,
        underscored: true
    });

    return Referrer;
};
