'use strict';

module.exports = (sequelize, DataTypes) => {
    const PlanExclusion = sequelize.define('PlanExclusion', {
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
        tableName: 'plan_exclusions',
        timestamps: true,
        underscored: true
    });

    return PlanExclusion;
};
