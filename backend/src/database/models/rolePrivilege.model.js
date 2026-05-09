'use strict';

module.exports = (sequelize, DataTypes) => {
    const RolePrivilege = sequelize.define('RolePrivilege', {
        id: {
            type: DataTypes.UUID,
            allowNull: false,
            primaryKey: true,
            defaultValue: DataTypes.UUIDV4,
            field: 'id'
        },
        roleId: {
            type: DataTypes.UUID,
            allowNull: false,
            field: 'role_id'
        },
        privilegeId: {
            type: DataTypes.UUID,
            allowNull: false,
            field: 'privilege_id'
        }
    }, {
        tableName: 'role_privileges',
        timestamps: true,
        underscored: true
    });

    return RolePrivilege;
};
