'use strict';

module.exports = (sequelize, DataTypes) => {
    const Admin = sequelize.define('Admin', {
        id: {
            type: DataTypes.UUID,
            allowNull: false,
            primaryKey: true,
            defaultValue: DataTypes.UUIDV4,
            field: 'id'
        },
        firstName: {
            type: DataTypes.STRING,
            allowNull: false,
            field: 'first_name'
        },
        lastName: {
            type: DataTypes.STRING,
            allowNull: false,
            field: 'last_name'
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
            validate: {
                isEmail: true
            },
            field: 'email'
        },
        passwordHash: {
            type: DataTypes.STRING,
            allowNull: false,
            field: 'password_hash'
        },
        phoneNumber: {
            type: DataTypes.STRING,
            allowNull: true,
            field: 'phone_number'
        },
        picture: {
            type: DataTypes.STRING,
            allowNull: true,
            field: 'picture'
        },
        state: {
            type: DataTypes.STRING,
            allowNull: true,
            field: 'state'
        },
        country: {
            type: DataTypes.STRING,
            allowNull: true,
            field: 'country'
        },
        currentLocation: {
            type: DataTypes.STRING,
            allowNull: true,
            field: 'current_location'
        },
        latitude: {
            type: DataTypes.DECIMAL(10, 8),
            allowNull: true,
            field: 'latitude'
        },
        longitude: {
            type: DataTypes.DECIMAL(11, 8),
            allowNull: true,
            field: 'longitude'
        },
        address: {
            type: DataTypes.STRING,
            allowNull: true,
            field: 'address'
        },
        city: {
            type: DataTypes.STRING,
            allowNull: true,
            field: 'city'
        },
        postalCode: {
            type: DataTypes.STRING,
            allowNull: true,
            field: 'postal_code'
        },
        status: {
            type: DataTypes.ENUM('active', 'inactive', 'suspended'),
            allowNull: false,
            defaultValue: 'active',
            field: 'status'
        },
        isDeleted: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
            field: 'is_deleted'
        }
    }, {
        tableName: 'admins',
        timestamps: true,
        underscored: true

    })
    return Admin;
}