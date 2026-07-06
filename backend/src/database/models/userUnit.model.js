'use strict';

module.exports = (sequelize, DataTypes) => {
    const UserUnit = sequelize.define('UserUnit', {
        id: {
            type: DataTypes.UUID,
            allowNull: false,
            primaryKey: true,
            defaultValue: DataTypes.UUIDV4,
            field: 'id'
        },
        userId: {
            type: DataTypes.UUID,
            allowNull: false,
            field: 'user_id'
        },
        userType: {
            type: DataTypes.STRING,
            allowNull: false,
            field: 'user_type'
        },
        unitId: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: 'units',
                key: 'id'
            },
            field: 'unit_id'
        }
    }, {
        tableName: 'user_units',
        timestamps: true,
        underscored: true
    });

    return UserUnit;
}