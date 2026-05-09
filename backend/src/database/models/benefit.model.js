'use strict';

module.exports = (sequelize, DataTypes) => {
    const Benefit = sequelize.define('Benefit', {
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
        description: {
            type: DataTypes.TEXT,
            allowNull: true,
            field: 'description'
        },
        isCovered: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
            field: 'is_covered'
        },
        coverageType: {
            type: DataTypes.ENUM('times_per_year', 'times_per_month', 'quarterly', 'unlimited', 'amount_based', 'limit_based'),
            allowNull: true,
            field: 'coverage_type'
        },
        coverageValue: {
            type: DataTypes.STRING,
            allowNull: true,
            field: 'coverage_value'
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
        tableName: 'benefits',
        timestamps: true,
        underscored: true
    });

    return Benefit;
};
