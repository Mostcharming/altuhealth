'use strict';

module.exports = (sequelize, DataTypes) => {
    const Company = sequelize.define('Company', {
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
        phoneNumber: {
            type: DataTypes.STRING,
            allowNull: true,
            field: 'phone_number'
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
            field: 'email'
        },
        isActive: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: true,
            field: 'is_active'
        }
    }, {
        tableName: 'companies',
        timestamps: true,
        underscored: true
    });

    return Company;
};
