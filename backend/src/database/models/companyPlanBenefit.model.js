'use strict';

module.exports = (sequelize, DataTypes) => {
    const CompanyPlanBenefit = sequelize.define('CompanyPlanBenefit', {
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
        benefitId: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: 'benefits',
                key: 'id'
            },
            field: 'benefit_id'
        }
    }, {
        tableName: 'company_plan_benefits',
        timestamps: true,
        underscored: true
    });

    return CompanyPlanBenefit;
};
