'use strict';

module.exports = (sequelize, DataTypes) => {
    const CompanyPlan = sequelize.define('CompanyPlan', {
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
        planType: {
            type: DataTypes.STRING,
            allowNull: false,
            field: 'plan_type'
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
            field: 'name'
        },
        ageLimit: {
            type: DataTypes.INTEGER,
            allowNull: true,
            field: 'age_limit'
        },
        dependentAgeLimit: {
            type: DataTypes.INTEGER,
            allowNull: true,
            field: 'dependent_age_limit'
        },
        maxNumberOfDependents: {
            type: DataTypes.INTEGER,
            allowNull: true,
            field: 'max_number_of_dependents'
        },
        discountPerEnrolee: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: true,
            field: 'discount_per_enrolee'
        },
        planCycle: {
            type: DataTypes.STRING,
            allowNull: false,
            field: 'plan_cycle',
            comment: 'e.g., monthly, quarterly, annual'
        },
        annualPremiumPrice: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
            field: 'annual_premium_price'
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: true,
            field: 'description'
        },
        allowDependentEnrolee: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: true,
            field: 'allow_dependent_enrolee'
        },
        isActive: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: true,
            field: 'is_active'
        }
    }, {
        tableName: 'company_plans',
        timestamps: true,
        underscored: true
    });

    return CompanyPlan;
};
