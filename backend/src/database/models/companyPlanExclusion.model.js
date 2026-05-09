'use strict';

module.exports = (sequelize, DataTypes) => {
    const CompanyPlanExclusion = sequelize.define('CompanyPlanExclusion', {
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
        exclusionId: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: 'exclusions',
                key: 'id'
            },
            field: 'exclusion_id'
        }
    }, {
        tableName: 'company_plan_exclusions',
        timestamps: true,
        underscored: true
    });

    return CompanyPlanExclusion;
};
