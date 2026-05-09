'use strict';

module.exports = (sequelize, DataTypes) => {
    const ClaimDetailItem = sequelize.define('ClaimDetailItem', {
        id: {
            type: DataTypes.UUID,
            allowNull: false,
            primaryKey: true,
            defaultValue: DataTypes.UUIDV4,
            field: 'id'
        },
        claimDetailId: {
            type: DataTypes.UUID,
            allowNull: false,
            field: 'claim_detail_id'
        },
        itemType: {
            type: DataTypes.ENUM('drug', 'service'),
            allowNull: false,
            field: 'item_type'
        },
        itemId: {
            type: DataTypes.UUID,
            allowNull: false,
            field: 'item_id'
        },
        itemName: {
            type: DataTypes.STRING,
            allowNull: false,
            field: 'item_name'
        },
        quantity: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 1,
            field: 'quantity'
        },
        unitPrice: {
            type: DataTypes.DECIMAL(15, 2),
            allowNull: false,
            field: 'unit_price'
        },
        totalAmount: {
            type: DataTypes.DECIMAL(15, 2),
            allowNull: false,
            field: 'total_amount'
        },
        unit: {
            type: DataTypes.STRING,
            allowNull: true,
            field: 'unit'
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: true,
            field: 'description'
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
        tableName: 'claim_detail_items',
        timestamps: false
    });

    return ClaimDetailItem;
};
