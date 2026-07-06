'use strict';

module.exports = (sequelize, DataTypes) => {
    const PasswordReset = sequelize.define('PasswordReset', {
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
        token: {
            type: DataTypes.STRING,
            allowNull: false,
            field: 'token'
        },
        isUsed: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
            field: 'is_used'
        }
    }, {
        tableName: 'password_resets',
        timestamps: true,
        underscored: true
    });

    return PasswordReset;
};
