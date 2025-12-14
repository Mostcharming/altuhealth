'use strict';

module.exports = (sequelize, DataTypes) => {
    const Payment = sequelize.define('Payment', {
        id: {
            type: DataTypes.UUID,
            allowNull: false,
            primaryKey: true,
            defaultValue: DataTypes.UUIDV4,
            field: 'id'
        },
        invoiceId: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: 'invoices',
                key: 'id'
            },
            onDelete: 'CASCADE',
            onUpdate: 'CASCADE',
            field: 'invoice_id'
        },
        paymentNumber: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
            field: 'payment_number',
            comment: 'Unique payment reference number (e.g., PAY-2025-001)'
        },
        paymentAmount: {
            type: DataTypes.DECIMAL(15, 2),
            allowNull: false,
            field: 'payment_amount',
            comment: 'Amount paid in this transaction'
        },
        paymentDate: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
            field: 'payment_date',
            comment: 'Date the payment was received'
        },
        paymentMethod: {
            type: DataTypes.ENUM('bank_transfer', 'cash', 'cheque', 'card', 'mobile_money', 'wallet', 'other'),
            allowNull: false,
            field: 'payment_method'
        },
        currency: {
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: 'NGN',
            field: 'currency',
            comment: 'Currency code (e.g., NGN, USD)'
        },
        transactionReference: {
            type: DataTypes.STRING,
            allowNull: true,
            field: 'transaction_reference',
            comment: 'Bank transaction reference or receipt number'
        },
        bankName: {
            type: DataTypes.STRING,
            allowNull: true,
            field: 'bank_name',
            comment: 'Bank name for bank transfers'
        },
        accountName: {
            type: DataTypes.STRING,
            allowNull: true,
            field: 'account_name',
            comment: 'Account name for bank transfers'
        },
        chequeNumber: {
            type: DataTypes.STRING,
            allowNull: true,
            field: 'cheque_number',
            comment: 'Cheque number if payment is by cheque'
        },
        chequeDate: {
            type: DataTypes.DATE,
            allowNull: true,
            field: 'cheque_date',
            comment: 'Date on cheque'
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
        description: {
            type: DataTypes.TEXT,
            allowNull: true,
            field: 'description',
            comment: 'Additional notes about the payment'
        },
        receiptUrl: {
            type: DataTypes.STRING,
            allowNull: true,
            field: 'receipt_url',
            comment: 'URL to payment receipt/proof'
        },
        status: {
            type: DataTypes.ENUM('pending', 'completed', 'failed', 'cancelled', 'refunded'),
            allowNull: false,
            defaultValue: 'completed',
            field: 'status'
        },
        processedBy: {
            type: DataTypes.UUID,
            allowNull: true,
            field: 'processed_by',
            comment: 'Admin user who recorded/processed the payment'
        },
        processedByType: {
            type: DataTypes.ENUM('Admin', 'System', 'Automated'),
            allowNull: false,
            defaultValue: 'System',
            field: 'processed_by_type'
        },
        verificationStatus: {
            type: DataTypes.ENUM('unverified', 'verified', 'failed_verification'),
            allowNull: false,
            defaultValue: 'unverified',
            field: 'verification_status',
            comment: 'Whether payment has been verified/confirmed'
        },
        verifiedAt: {
            type: DataTypes.DATE,
            allowNull: true,
            field: 'verified_at',
            comment: 'Timestamp when payment was verified'
        },
        verifiedBy: {
            type: DataTypes.UUID,
            allowNull: true,
            field: 'verified_by',
            comment: 'Admin who verified the payment'
        },
        refundAmount: {
            type: DataTypes.DECIMAL(15, 2),
            allowNull: true,
            defaultValue: 0,
            field: 'refund_amount',
            comment: 'Amount refunded (if applicable)'
        },
        refundDate: {
            type: DataTypes.DATE,
            allowNull: true,
            field: 'refund_date',
            comment: 'Date refund was processed'
        },
        refundReason: {
            type: DataTypes.TEXT,
            allowNull: true,
            field: 'refund_reason'
        },
        failureReason: {
            type: DataTypes.TEXT,
            allowNull: true,
            field: 'failure_reason',
            comment: 'Reason for payment failure'
        },
        notes: {
            type: DataTypes.TEXT,
            allowNull: true,
            field: 'notes'
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
        tableName: 'payments',
        timestamps: true,
        underscored: true
    });

    return Payment;
};
