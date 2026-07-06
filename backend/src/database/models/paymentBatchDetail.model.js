'use strict';

module.exports = (sequelize, DataTypes) => {
    const PaymentBatchDetail = sequelize.define('PaymentBatchDetail', {
        id: {
            type: DataTypes.UUID,
            allowNull: false,
            primaryKey: true,
            defaultValue: DataTypes.UUIDV4,
            field: 'id'
        },
        paymentBatchId: {
            type: DataTypes.UUID,
            allowNull: false,
            field: 'payment_batch_id'
        },
        providerId: {
            type: DataTypes.UUID,
            allowNull: false,
            field: 'provider_id'
        },
        period: {
            type: DataTypes.STRING,
            allowNull: false,
            field: 'period'
        },
        claimsCount: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
            field: 'claims_count'
        },
        reconciliationCount: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
            field: 'reconciliation_count'
        },
        reconciliationAmount: {
            type: DataTypes.DECIMAL(15, 2),
            allowNull: false,
            defaultValue: 0,
            field: 'reconciliation_amount'
        },
        claimsAmount: {
            type: DataTypes.DECIMAL(15, 2),
            allowNull: false,
            defaultValue: 0,
            field: 'claims_amount'
        },
        paymentStatus: {
            type: DataTypes.ENUM('pending', 'paid', 'partial', 'disputed'),
            allowNull: false,
            defaultValue: 'pending',
            field: 'payment_status'
        },
        notes: {
            type: DataTypes.TEXT,
            allowNull: true,
            field: 'notes'
        }
    }, {
        tableName: 'payment_batch_details',
        timestamps: true,
        underscored: true
    });

    return PaymentBatchDetail;
};
