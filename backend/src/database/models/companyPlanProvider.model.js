'use strict';

module.exports = (sequelize, DataTypes) => {
    const CompanyPlanProvider = sequelize.define('CompanyPlanProvider', {
        id: {
            type: DataTypes.UUID,
            allowNull: false,
            primaryKey: true,
            defaultValue: DataTypes.UUIDV4,
            field: 'id'
        },
        companyPlanId: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: 'company_plans',
                key: 'id'
            },
            field: 'company_plan_id'
        },
        providerId: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: 'providers',
                key: 'id'
            },
            field: 'provider_id'
        }
    }, {
        tableName: 'company_plan_providers',
        timestamps: true,
        underscored: true
    });

    return CompanyPlanProvider;
};
