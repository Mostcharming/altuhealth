'use strict';

module.exports = (sequelize, DataTypes) => {
    const CurrencyRate = sequelize.define('CurrencyRate', {
        id: {
            type: DataTypes.UUID,
            allowNull: false,
            primaryKey: true,
            defaultValue: DataTypes.UUIDV4
        },
        currencyCode: {
            type: DataTypes.STRING(3),
            allowNull: false,
            unique: true,
            field: 'currency_code'
        },
        currencyName: {
            type: DataTypes.STRING,
            allowNull: false,
            field: 'currency_name'
        },
        rateToNgn: {
            type: DataTypes.DECIMAL(20, 8),
            allowNull: false,
            field: 'rate_to_ngn'
        },
        ngnToCurrencyRate: {
            type: DataTypes.DECIMAL(20, 8),
            allowNull: false,
            field: 'ngn_to_currency_rate'
        },
        source: {
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: 'manual'
        },
        sourcePayload: {
            type: DataTypes.JSON,
            allowNull: true,
            field: 'source_payload'
        },
        lastFetchedAt: {
            type: DataTypes.DATE,
            allowNull: true,
            field: 'last_fetched_at'
        },
        isActive: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: true,
            field: 'is_active'
        },
        notes: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        createdAt: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
            field: 'created_at'
        },
        updatedAt: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
            field: 'updated_at'
        }
    }, {
        tableName: 'currency_rates',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    });

    return CurrencyRate;
};
