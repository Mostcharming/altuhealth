'use strict';

module.exports = (sequelize, DataTypes) => {
    const UtilizationReview = sequelize.define('UtilizationReview', {
        id: {
            type: DataTypes.UUID,
            allowNull: false,
            primaryKey: true,
            defaultValue: DataTypes.UUIDV4,
            field: 'id'
        },
        companyId: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: 'companies',
                key: 'id'
            },
            field: 'company_id'
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
        policyPeriodStartDate: {
            type: DataTypes.DATE,
            allowNull: false,
            field: 'policy_period_start_date'
        },
        policyPeriodEndDate: {
            type: DataTypes.DATE,
            allowNull: false,
            field: 'policy_period_end_date'
        },
        quarter: {
            type: DataTypes.ENUM('Q1', 'Q2', 'Q3', 'Q4'),
            allowNull: false,
            field: 'quarter'
        },
        totalEnrollees: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
            field: 'total_enrollees'
        },
        totalDependents: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
            field: 'total_dependents'
        },
        totalClaimAmount: {
            type: DataTypes.DECIMAL(15, 2),
            allowNull: false,
            defaultValue: 0.00,
            field: 'total_claim_amount'
        },
        utilizationRate: {
            type: DataTypes.DECIMAL(5, 2),
            allowNull: false,
            defaultValue: 0.00,
            field: 'utilization_rate',
            comment: 'Percentage (0-100)'
        },
        topUtilizedServices: {
            type: DataTypes.JSON,
            allowNull: true,
            field: 'top_utilized_services',
            comment: 'Array of services with usage count'
        },
        topProviders: {
            type: DataTypes.JSON,
            allowNull: true,
            field: 'top_providers',
            comment: 'Array of providers with claim count'
        },
        excludedServiceAttempts: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
            field: 'excluded_service_attempts'
        },
        status: {
            type: DataTypes.ENUM('draft', 'completed', 'pending_approval', 'approved'),
            allowNull: false,
            defaultValue: 'draft',
            field: 'status'
        }
    }, {
        tableName: 'utilization_reviews',
        timestamps: true,
        underscored: true
    });

    return UtilizationReview;
};
