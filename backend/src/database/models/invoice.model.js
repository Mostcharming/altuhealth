'use strict';

module.exports = (sequelize, DataTypes) => {
    const Invoice = sequelize.define('Invoice', {
        id: {
            type: DataTypes.UUID,
            allowNull: false,
            primaryKey: true,
            defaultValue: DataTypes.UUIDV4,
            field: 'id'
        },
        invoiceNumber: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
            field: 'invoice_number',
            comment: 'Unique invoice number (e.g., INV-2025-001)'
        },
        providerId: {
            type: DataTypes.UUID,
            allowNull: true,
            references: {
                model: 'providers',
                key: 'id'
            },
            onDelete: 'SET NULL',
            onUpdate: 'CASCADE',
            field: 'provider_id'
        },
        enrolleeId: {
            type: DataTypes.UUID,
            allowNull: true,
            references: {
                model: 'enrollees',
                key: 'id'
            },
            onDelete: 'SET NULL',
            onUpdate: 'CASCADE',
            field: 'enrollee_id'
        },
        retailEnrolleeId: {
            type: DataTypes.UUID,
            allowNull: true,
            references: {
                model: 'retail_enrollees',
                key: 'id'
            },
            onDelete: 'SET NULL',
            onUpdate: 'CASCADE',
            field: 'retail_enrollee_id'
        },
        customerName: {
            type: DataTypes.STRING,
            allowNull: false,
            field: 'customer_name',
            comment: 'Customer or patient name'
        },
        customerAddress: {
            type: DataTypes.TEXT,
            allowNull: true,
            field: 'customer_address',
            comment: 'Customer address'
        },
        customerPhone: {
            type: DataTypes.STRING,
            allowNull: true,
            field: 'customer_phone'
        },
        customerEmail: {
            type: DataTypes.STRING,
            allowNull: true,
            field: 'customer_email'
        },
        invoiceDate: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
            field: 'invoice_date'
        },
        dueDate: {
            type: DataTypes.DATE,
            allowNull: true,
            field: 'due_date'
        },
        subtotal: {
            type: DataTypes.DECIMAL(15, 2),
            allowNull: false,
            defaultValue: 0,
            field: 'subtotal',
            comment: 'Sum of all line items before discount'
        },
        discountAmount: {
            type: DataTypes.DECIMAL(15, 2),
            allowNull: false,
            defaultValue: 0,
            field: 'discount_amount',
            comment: 'Total discount across all line items'
        },
        discountPercentage: {
            type: DataTypes.DECIMAL(5, 2),
            allowNull: true,
            field: 'discount_percentage',
            comment: 'Optional percentage discount applied'
        },
        taxAmount: {
            type: DataTypes.DECIMAL(15, 2),
            allowNull: false,
            defaultValue: 0,
            field: 'tax_amount'
        },
        taxPercentage: {
            type: DataTypes.DECIMAL(5, 2),
            allowNull: true,
            field: 'tax_percentage',
            comment: 'Tax percentage (e.g., VAT, GST)'
        },
        totalAmount: {
            type: DataTypes.DECIMAL(15, 2),
            allowNull: false,
            defaultValue: 0,
            field: 'total_amount',
            comment: 'Final amount due (subtotal - discount + tax)'
        },
        paidAmount: {
            type: DataTypes.DECIMAL(15, 2),
            allowNull: false,
            defaultValue: 0,
            field: 'paid_amount',
            comment: 'Amount paid so far'
        },
        balanceAmount: {
            type: DataTypes.DECIMAL(15, 2),
            allowNull: false,
            defaultValue: 0,
            field: 'balance_amount',
            comment: 'Outstanding balance (totalAmount - paidAmount)'
        },
        status: {
            type: DataTypes.ENUM('draft', 'issued', 'partially_paid', 'paid', 'overdue', 'cancelled'),
            allowNull: false,
            defaultValue: 'draft',
            field: 'status'
        },
        paymentStatus: {
            type: DataTypes.ENUM('unpaid', 'partially_paid', 'paid'),
            allowNull: false,
            defaultValue: 'unpaid',
            field: 'payment_status'
        },
        currency: {
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: 'NGN',
            field: 'currency',
            comment: 'Currency code (e.g., NGN, USD)'
        },
        notes: {
            type: DataTypes.TEXT,
            allowNull: true,
            field: 'notes',
            comment: 'Additional notes or payment instructions'
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: true,
            field: 'description'
        },
        issuedBy: {
            type: DataTypes.UUID,
            allowNull: true,
            field: 'issued_by',
            comment: 'Admin user who issued the invoice'
        },
        issuedByType: {
            type: DataTypes.ENUM('Admin', 'System'),
            allowNull: false,
            defaultValue: 'System',
            field: 'issued_by_type'
        },
        cancelledAt: {
            type: DataTypes.DATE,
            allowNull: true,
            field: 'cancelled_at'
        },
        cancelledReason: {
            type: DataTypes.TEXT,
            allowNull: true,
            field: 'cancelled_reason'
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
        tableName: 'invoices',
        timestamps: true,
        underscored: true
    });

    return Invoice;
};
