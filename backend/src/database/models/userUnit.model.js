'use strict';

module.exports = (sequelize, DataTypes) => {
    const UserUnit = sequelize.define('UserUnit', {
        id: {
            type: DataTypes.UUID,
            allowNull: false,
            primaryKey: true,
            defaultValue: DataTypes.UUIDV4
        },
        userId: {
            type: DataTypes.UUID,
            allowNull: false,
        },
        userType: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        unitId: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: 'units',
                key: 'id'
            }
        }
    }, {
        tableName: 'user_units',
        timestamps: true,
    });

    return UserUnit;
}