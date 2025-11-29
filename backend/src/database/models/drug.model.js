'use strict';

module.exports = (sequelize, DataTypes) => {
    const Drug = sequelize.define('Drug', {
        id: {
            type: DataTypes.UUID,
            allowNull: false,
            primaryKey: true,
            defaultValue: DataTypes.UUIDV4,
            field: 'id'
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
            field: 'name'
        },
        unit: {
            type: DataTypes.STRING,
            allowNull: false,
            field: 'unit'
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: true,
            field: 'description'
        },
        strength: {
            type: DataTypes.STRING,
            allowNull: true,
            field: 'strength'
        },
        price: {
            type: DataTypes.DECIMAL(12, 2),
            allowNull: false,
            field: 'price'
        },
        status: {
            type: DataTypes.ENUM('active', 'inactive', 'pending'),
            allowNull: false,
            defaultValue: 'pending',
            field: 'status'
        },
        providerId: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: 'providers',
                key: 'id'
            },
            field: 'provider_id'
        },
        isDeleted: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
            field: 'is_deleted'
        }
    }, {
        tableName: 'drugs',
        timestamps: true,
        underscored: true
    });

    return Drug;
};
