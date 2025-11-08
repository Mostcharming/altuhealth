'use strict';

module.exports = (sequelize, DataTypes) => {
    const Role = sequelize.define('Role', {
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
            unique: true,
            field: 'name'
        },
        description: {
            type: DataTypes.STRING,
            allowNull: true,
            field: 'description'
        }
    }, {
        tableName: 'roles',
        timestamps: true,
        underscored: true
    });

    return Role;
}