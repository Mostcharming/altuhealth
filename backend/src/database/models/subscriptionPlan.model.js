'use strict';

module.exports = (sequelize, DataTypes) => {
    const SubscriptionPlan = sequelize.define('SubscriptionPlan', {
        id: {
            type: DataTypes.UUID,
            allowNull: false,
            primaryKey: true,
            defaultValue: DataTypes.UUIDV4,
            field: 'id'
        },
        subscriptionId: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: 'subscriptions',
                key: 'id'
            },
            onUpdate: 'CASCADE',
            onDelete: 'CASCADE',
            field: 'subscription_id'
        },
        companyPlanId: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: 'company_plans',
                key: 'id'
            },
            onUpdate: 'CASCADE',
            onDelete: 'CASCADE',
            field: 'company_plan_id'
        }
    }, {
        tableName: 'subscription_plans',
        timestamps: true,
        underscored: true,
        indexes: [
            {
                fields: ['subscription_id']
            },
            {
                fields: ['company_plan_id']
            }
        ]
    });

    return SubscriptionPlan;
};
