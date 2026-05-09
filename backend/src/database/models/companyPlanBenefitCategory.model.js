'use strict';

module.exports = (sequelize, DataTypes) => {
    const CompanyPlanBenefitCategory = sequelize.define('CompanyPlanBenefitCategory', {
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
        benefitCategoryId: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: 'benefit_categories',
                key: 'id'
            },
            field: 'benefit_category_id'
        }
    }, {
        tableName: 'company_plan_benefit_categories',
        timestamps: true,
        underscored: true
    });

    return CompanyPlanBenefitCategory;
};
