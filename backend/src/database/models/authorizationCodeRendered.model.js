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
        unit: {
            type: DataTypes.STRING,
            allowNull: true,
            field: 'unit'
        },
        quantityRendered: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: true,
            field: 'quantity_rendered'
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
