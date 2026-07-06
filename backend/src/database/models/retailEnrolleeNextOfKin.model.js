'use strict';

module.exports = (sequelize, DataTypes) => {
    const RetailEnrolleeNextOfKin = sequelize.define('RetailEnrolleeNextOfKin', {
        id: {
            type: DataTypes.UUID,
            allowNull: false,
            primaryKey: true,
            defaultValue: DataTypes.UUIDV4,
            field: 'id'
        },
        retailEnrolleeId: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: 'retail_enrollees',
                key: 'id'
            },
            onUpdate: 'CASCADE',
            onDelete: 'CASCADE',
            field: 'retail_enrollee_id'
        },
        firstName: {
            type: DataTypes.STRING,
            allowNull: false,
            field: 'first_name'
        },
        middleName: {
            type: DataTypes.STRING,
            allowNull: true,
            field: 'middle_name'
        },
        lastName: {
            type: DataTypes.STRING,
            allowNull: false,
            field: 'last_name'
        },
        email: {
            type: DataTypes.STRING,
            allowNull: true,
            validate: {
                isEmail: true
            },
            field: 'email'
        },
        phoneNumber: {
            type: DataTypes.STRING,
            allowNull: false,
            field: 'phone_number'
        },
        address: {
            type: DataTypes.TEXT,
            allowNull: true,
            field: 'address'
        }
    }, {
        tableName: 'retail_enrollee_next_of_kins',
        timestamps: true,
        underscored: true,
        indexes: [
            {
                fields: ['retail_enrollee_id']
            }
        ]
    });

    return RetailEnrolleeNextOfKin;
};
