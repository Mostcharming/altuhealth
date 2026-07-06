'use strict';

module.exports = (sequelize, DataTypes) => {
    const AuthorizationCodeRendered = sequelize.define('AuthorizationCodeRendered', {
        id: {
            type: DataTypes.UUID,
            allowNull: false,
            primaryKey: true,
            defaultValue: DataTypes.UUIDV4,
            field: 'id'
        },
        authorizationCodeId: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: 'authorization_codes',
                key: 'id'
            },
            onUpdate: 'CASCADE',
            onDelete: 'CASCADE',
            field: 'authorization_code_id'
        },
        drugId: {
            type: DataTypes.UUID,
            allowNull: true,
            references: {
                model: 'drugs',
                key: 'id'
            },
            onUpdate: 'CASCADE',
            onDelete: 'SET NULL',
            field: 'drug_id'
        },
        serviceId: {
            type: DataTypes.UUID,
            allowNull: true,
            references: {
                model: 'services',
                key: 'id'
            },
            onUpdate: 'CASCADE',
            onDelete: 'SET NULL',
            field: 'service_id'
        },
        itemName: {
            type: DataTypes.STRING,
            allowNull: true,
            field: 'item_name'
        },
        unit: {
            type: DataTypes.STRING,
            allowNull: true,
            field: 'unit'
        },
        unitPrice: {
            type: DataTypes.DECIMAL(12, 2),
            allowNull: true,
            field: 'unit_price'
        },
        quantityRendered: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: true,
            field: 'quantity_rendered'
        },
        lineAmount: {
            type: DataTypes.DECIMAL(12, 2),
            allowNull: true,
            field: 'line_amount'
        },
        approvedAmount: {
            type: DataTypes.DECIMAL(12, 2),
            allowNull: true,
            field: 'approved_amount'
        },
        adminComment: {
            type: DataTypes.TEXT,
            allowNull: true,
            field: 'admin_comment'
        },
        reviewedBy: {
            type: DataTypes.UUID,
            allowNull: true,
            references: {
                model: 'admins',
                key: 'id'
            },
            onUpdate: 'CASCADE',
            onDelete: 'SET NULL',
            field: 'reviewed_by'
        },
        reviewedAt: {
            type: DataTypes.DATE,
            allowNull: true,
            field: 'reviewed_at'
        },
        status: {
            type: DataTypes.ENUM('pending', 'approved', 'rejected', 'partial'),
            allowNull: false,
            defaultValue: 'pending',
            field: 'status'
        },
        notes: {
            type: DataTypes.TEXT,
            allowNull: true,
            field: 'notes'
        }
    }, {
        tableName: 'authorization_code_rendered',
        timestamps: true,
        underscored: true
    });

    return AuthorizationCodeRendered;
};
