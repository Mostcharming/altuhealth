'use strict';

module.exports = (sequelize, DataTypes) => {
    const PaymentBatch = sequelize.define('PaymentBatch', {
        id: {
            type: DataTypes.UUID,
            allowNull: false,
            primaryKey: true,
            defaultValue: DataTypes.UUIDV4,
            field: 'id'
        },
        title: {
            type: DataTypes.STRING,
            allowNull: false,
            field: 'title'
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: true,
            field: 'description'
        },
        numberOfBatches: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
            field: 'number_of_batches'
        },
        numberOfProviders: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
            field: 'number_of_providers'
        },
        conflictCount: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
            field: 'conflict_count'
        },
        totalClaimsAmount: {
            type: DataTypes.DECIMAL(15, 2),
            allowNull: false,
            defaultValue: 0,
            field: 'total_claims_amount'
        },
        reconciliationAmount: {
            type: DataTypes.DECIMAL(15, 2),
            allowNull: false,
            defaultValue: 0,
            field: 'reconciliation_amount'
        },
        status: {
            type: DataTypes.ENUM('pending', 'processing', 'completed', 'failed', 'partial'),
            allowNull: false,
            defaultValue: 'pending',
            field: 'status'
        },
        isPaid: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
            field: 'is_paid'
        },
        numberPaid: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
            field: 'number_paid'
        },
        numberUnpaid: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
            field: 'number_unpaid'
        },
        paidAmount: {
            type: DataTypes.DECIMAL(15, 2),
            allowNull: false,
            defaultValue: 0,
            field: 'paid_amount'
        },
        unpaidAmount: {
            type: DataTypes.DECIMAL(15, 2),
            allowNull: false,
            defaultValue: 0,
            field: 'unpaid_amount'
        }
    }, {
        tableName: 'payment_batches',
        timestamps: true,
        underscored: true
    });

    return PaymentBatch;
};
