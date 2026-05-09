'use strict';

module.exports = (sequelize, DataTypes) => {
    const PlanBenefitCategory = sequelize.define('PlanBenefitCategory', {
        id: {
            type: DataTypes.UUID,
            allowNull: false,
            primaryKey: true,
            defaultValue: DataTypes.UUIDV4,
            field: 'id'
        },
        planId: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: 'plans',
                key: 'id'
            },
            field: 'plan_id'
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
        tableName: 'plan_benefit_categories',
        timestamps: true,
        underscored: true
    });

    return PlanBenefitCategory;
};
