'use strict';

module.exports = (sequelize, DataTypes) => {
    const Privilege = sequelize.define('Privilege', {
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
        tableName: 'privileges',
        timestamps: true,
        underscored: true
    });

    return Privilege;
};
