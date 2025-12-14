'use strict';

module.exports = (sequelize, DataTypes) => {
    const InvoiceLineItem = sequelize.define('InvoiceLineItem', {
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
        itemNumber: {
            type: DataTypes.INTEGER,
            allowNull: false,
            field: 'item_number',
            comment: 'Line item number (1, 2, 3, etc.)'
        },
        serviceName: {
            type: DataTypes.STRING,
            allowNull: false,
            field: 'service_name',
            comment: 'Name of service or product'
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: true,
            field: 'description',
            comment: 'Detailed description of the service/product'
        },
        quantity: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
            defaultValue: 1,
            field: 'quantity'
        },
        unitOfMeasure: {
            type: DataTypes.STRING,
            allowNull: true,
            defaultValue: 'unit',
            field: 'unit_of_measure',
            comment: 'e.g., unit, kg, liter, hour'
        },
        unitCost: {
            type: DataTypes.DECIMAL(15, 2),
            allowNull: false,
            field: 'unit_cost',
            comment: 'Price per unit'
        },
        subtotal: {
            type: DataTypes.DECIMAL(15, 2),
            allowNull: false,
            field: 'subtotal',
            comment: 'quantity * unitCost'
        },
        discountAmount: {
            type: DataTypes.DECIMAL(15, 2),
            allowNull: false,
            defaultValue: 0,
            field: 'discount_amount',
            comment: 'Discount on this line item'
        },
        discountPercentage: {
            type: DataTypes.DECIMAL(5, 2),
            allowNull: true,
            field: 'discount_percentage',
            comment: 'Discount percentage for this line'
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
            field: 'tax_percentage'
        },
        lineTotal: {
            type: DataTypes.DECIMAL(15, 2),
            allowNull: false,
            field: 'line_total',
            comment: '(subtotal - discountAmount) + taxAmount'
        },
        serviceId: {
            type: DataTypes.UUID,
            allowNull: true,
            references: {
                model: 'services',
                key: 'id'
            },
            onDelete: 'SET NULL',
            onUpdate: 'CASCADE',
            field: 'service_id',
            comment: 'Link to service master if applicable'
        },
        productId: {
            type: DataTypes.UUID,
            allowNull: true,
            field: 'product_id',
            comment: 'Generic product ID if not linked to service'
        },
        productCode: {
            type: DataTypes.STRING,
            allowNull: true,
            field: 'product_code'
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
        tableName: 'invoice_line_items',
        timestamps: true,
        underscored: true
    });

    return InvoiceLineItem;
};
