'use strict';

module.exports = (sequelize, DataTypes) => {
    const UserRole = sequelize.define('UserRole', {
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
        roleId: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: 'roles',
                key: 'id'
            },
            field: 'role_id'
        }
    }, {
        tableName: 'user_roles',
        timestamps: true,
        underscored: true
    });

    return UserRole;
}