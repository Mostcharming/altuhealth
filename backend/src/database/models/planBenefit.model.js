'use strict';

module.exports = (sequelize, DataTypes) => {
    const PlanBenefit = sequelize.define('PlanBenefit', {
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
        tableName: 'plan_benefits',
        timestamps: true,
        underscored: true
    });

    return PlanBenefit;
};
