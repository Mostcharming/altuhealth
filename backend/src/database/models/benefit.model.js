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
        limit: {
            type: DataTypes.STRING,
            allowNull: true,
            field: 'limit'
        },
        amount: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
            field: 'amount'
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
