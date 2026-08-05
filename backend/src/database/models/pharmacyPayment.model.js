'use strict';

module.exports = (sequelize, DataTypes) => {
    return sequelize.define('PharmacyPayment', {
        id: {
            type: DataTypes.UUID,
            allowNull: false,
            primaryKey: true,
            defaultValue: DataTypes.UUIDV4
        },
        pharmacyRequestId: {
            type: DataTypes.UUID,
            allowNull: false,
            unique: true,
            field: 'pharmacy_request_id'
        },
        paymentNumber: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
            field: 'payment_number'
        },
        amount: {
            type: DataTypes.DECIMAL(15, 2),
            allowNull: false
        },
        currency: {
            type: DataTypes.STRING(3),
            allowNull: false,
            defaultValue: 'NGN'
        },
        paymentDate: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
            field: 'payment_date'
        },
        paymentMethod: {
            type: DataTypes.ENUM('bank_transfer', 'cash', 'cheque', 'mobile_money', 'wallet', 'other'),
            allowNull: false,
            field: 'payment_method'
        },
        transactionReference: {
            type: DataTypes.STRING,
            allowNull: true,
            field: 'transaction_reference'
        },
        beneficiaryName: {
            type: DataTypes.STRING,
            allowNull: false,
            field: 'beneficiary_name'
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
            field: 'account_number'
        },
        proofUrl: {
            type: DataTypes.STRING,
            allowNull: true,
            field: 'proof_url'
        },
        notes: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        recordedBy: {
            type: DataTypes.UUID,
            allowNull: true,
            field: 'recorded_by'
        }
    }, {
        tableName: 'pharmacy_payments',
        timestamps: true,
        underscored: true
    });
};
