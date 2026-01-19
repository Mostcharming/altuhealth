'use strict';

module.exports = (sequelize, DataTypes) => {
    const Service = sequelize.define('Service', {
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
        code: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
            field: 'code'
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: true,
            field: 'description'
        },
        requiresPreauthorization: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
            field: 'requires_preauthorization'
        },
        price: {
            type: DataTypes.DECIMAL(12, 2),
            allowNull: true,
            field: 'price'
        },
        priceType: {
            type: DataTypes.ENUM('fixed', 'rate'),
            allowNull: false,
            defaultValue: 'fixed',
            field: 'price_type'
        },
        fixedPrice: {
            type: DataTypes.DECIMAL(12, 2),
            allowNull: true,
            field: 'fixed_price'
        },
        rateType: {
            type: DataTypes.ENUM(
                'per_session',
                'per_visit',
                'per_hour',
                'per_day',
                'per_week',
                'per_month',
                'per_consultation',
                'per_procedure',
                'per_unit',
                'per_mile'
            ),
            allowNull: true,
            field: 'rate_type'
        },
        rateAmount: {
            type: DataTypes.DECIMAL(12, 2),
            allowNull: true,
            field: 'rate_amount'
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
        tableName: 'services',
        timestamps: true,
        underscored: true
    });

    return Service;
};
