'use strict';

module.exports = (sequelize, DataTypes) => {
    const RetailEnrolleeDependent = sequelize.define('RetailEnrolleeDependent', {
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
        phoneNumber: {
            type: DataTypes.STRING,
            allowNull: true,
            field: 'phone_number'
        },
        email: {
            type: DataTypes.STRING,
            allowNull: true,
            validate: {
                isEmail: true
            },
            field: 'email'
        },
        dateOfBirth: {
            type: DataTypes.DATE,
            allowNull: false,
            field: 'date_of_birth'
        },
        gender: {
            type: DataTypes.ENUM('male', 'female', 'other'),
            allowNull: false,
            field: 'gender'
        },
        relationship: {
            type: DataTypes.STRING,
            allowNull: false,
            field: 'relationship',
            comment: 'Relationship to the enrollee e.g., spouse, child, parent'
        },
        state: {
            type: DataTypes.STRING,
            allowNull: true,
            field: 'state'
        },
        lga: {
            type: DataTypes.STRING,
            allowNull: true,
            field: 'lga'
        },
        country: {
            type: DataTypes.STRING,
            allowNull: true,
            field: 'country'
        },
        address: {
            type: DataTypes.TEXT,
            allowNull: true,
            field: 'address'
        },
        isActive: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: true,
            field: 'is_active'
        },
        pictureUrl: {
            type: DataTypes.STRING,
            allowNull: true,
            field: 'picture_url'
        },
        idCardUrl: {
            type: DataTypes.STRING,
            allowNull: true,
            field: 'id_card_url'
        }
    }, {
        tableName: 'retail_enrollee_dependents',
        timestamps: true,
        underscored: true,
        indexes: [
            {
                fields: ['retail_enrollee_id']
            },
            {
                fields: ['email']
            }
        ]
    });

    return RetailEnrolleeDependent;
};
