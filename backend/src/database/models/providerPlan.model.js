'use strict';

module.exports = (sequelize, DataTypes) => {
    const ProviderPlan = sequelize.define('ProviderPlan', {
        id: {
            type: DataTypes.UUID,
            allowNull: false,
            primaryKey: true,
            defaultValue: DataTypes.UUIDV4,
            field: 'id'
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
        planId: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: 'plans',
                key: 'id'
            },
            field: 'plan_id'
        }
    }, {
        tableName: 'provider_plans',
        timestamps: true,
        underscored: true
    });

    return ProviderPlan;
};
