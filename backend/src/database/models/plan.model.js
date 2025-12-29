'use strict';

module.exports = (sequelize, DataTypes) => {
    const Plan = sequelize.define('Plan', {
        id: {
            type: DataTypes.UUID,
            allowNull: false,
            primaryKey: true,
            defaultValue: DataTypes.UUIDV4,
            field: 'id'
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
            field: 'name'
        },
        code: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
            field: 'code'
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: true,
            field: 'description'
        },
        status: {
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: 'pending',
            field: 'status'
        },
        isActive: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
            field: 'is_active'
        },
        isApproved: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
            field: 'is_approved'
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
            allowNull: true,
            field: 'plan_cycle',
            comment: 'e.g., monthly, quarterly, annual'
        },
        annualPremiumPrice: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: true,
            field: 'annual_premium_price'
        },
        allowDependentEnrolee: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: true,
            field: 'allow_dependent_enrolee'
        }
    }, {
        tableName: 'plans',
        timestamps: true,
        underscored: true
    });

    return Plan;
};
