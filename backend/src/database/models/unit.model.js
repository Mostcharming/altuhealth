'use strict';

module.exports = (sequelize, DataTypes) => {
    const Unit = sequelize.define('Unit', {
        id: {
            type: DataTypes.UUID,
            allowNull: false,
            primaryKey: true,
            defaultValue: DataTypes.UUIDV4
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
        },
        accountType: {
            type: DataTypes.ENUM('admin', 'enrollee', 'provider', 'corporate'),
            allowNull: false,
            field: 'account_type'
        }
    }, {
        tableName: 'units',
        timestamps: true,
        underscored: true
    });

    return Unit;
}