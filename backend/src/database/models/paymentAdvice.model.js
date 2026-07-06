'use strict';

module.exports = (sequelize, DataTypes) => {
    const PaymentAdvice = sequelize.define('PaymentAdvice', {
        id: {
            type: DataTypes.UUID,
            allowNull: false,
            primaryKey: true,
            defaultValue: DataTypes.UUIDV4,
            field: 'id'
        },
        paymentAdviceNumber: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
            field: 'payment_advice_number'
        },
        providerId: {
            type: DataTypes.UUID,
            allowNull: false,
            field: 'provider_id'
        },
        paymentBatchId: {
            type: DataTypes.UUID,
            allowNull: true,
            field: 'payment_batch_id'
        },
        totalAmount: {
            type: DataTypes.DECIMAL(15, 2),
            allowNull: false,
            defaultValue: 0,
            field: 'total_amount'
        },
        numberOfClaims: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
            field: 'number_of_claims'
        },
        paymentDate: {
            type: DataTypes.DATE,
            allowNull: false,
            field: 'payment_date'
        },
        dueDate: {
            type: DataTypes.DATE,
            allowNull: true,
            field: 'due_date'
        },
        paymentMethod: {
            type: DataTypes.ENUM('bank_transfer', 'check', 'cash', 'mobile_money'),
            allowNull: false,
            defaultValue: 'bank_transfer',
            field: 'payment_method'
        },
        bankName: {
            type: DataTypes.STRING,
            allowNull: true,
            field: 'bank_name'
        },
        bankAccountNumber: {
            type: DataTypes.STRING,
            allowNull: true,
            field: 'bank_account_number'
        },
        accountName: {
            type: DataTypes.STRING,
            allowNull: true,
            field: 'account_name'
        },
        accountType: {
            type: DataTypes.STRING,
            allowNull: true,
            field: 'account_type'
        },
        sortCode: {
            type: DataTypes.STRING,
            allowNull: true,
            field: 'sort_code'
        },
        routingNumber: {
            type: DataTypes.STRING,
            allowNull: true,
            field: 'routing_number'
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: true,
            field: 'description'
        },
        status: {
            type: DataTypes.ENUM('draft', 'approved', 'sent', 'acknowledged', 'cancelled'),
            allowNull: false,
            defaultValue: 'draft',
            field: 'status'
        },
        attachmentUrl: {
            type: DataTypes.STRING,
            allowNull: true,
            field: 'attachment_url'
        },
        approvedBy: {
            type: DataTypes.UUID,
            allowNull: true,
            field: 'approved_by'
        },
        approvedAt: {
            type: DataTypes.DATE,
            allowNull: true,
            field: 'approved_at'
        },
        sentAt: {
            type: DataTypes.DATE,
            allowNull: true,
            field: 'sent_at'
        },
        acknowledgedAt: {
            type: DataTypes.DATE,
            allowNull: true,
            field: 'acknowledged_at'
        },
        notes: {
            type: DataTypes.TEXT,
            allowNull: true,
            field: 'notes'
        },
        createdBy: {
            type: DataTypes.UUID,
            allowNull: true,
            field: 'created_by'
        },
        createdAt: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
            field: 'created_at'
        },
        updatedAt: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
            field: 'updated_at'
        }
    }, {
        tableName: 'payment_advices',
        timestamps: false
    });

    return PaymentAdvice;
};
