'use strict';

module.exports = (sequelize, DataTypes) => {
    const BenefitCategory = sequelize.define('BenefitCategory', {
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
        count: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
            field: 'count'
        }
    }, {
        tableName: 'benefit_categories',
        timestamps: true,
        underscored: true
    });

    return BenefitCategory;
};
