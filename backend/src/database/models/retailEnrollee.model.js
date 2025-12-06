'use strict';

module.exports = (sequelize, DataTypes) => {
    const RetailEnrollee = sequelize.define('RetailEnrollee', {
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
            allowNull: false,
            field: 'phone_number'
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false,
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
        maxDependents: {
            type: DataTypes.INTEGER,
            allowNull: true,
            field: 'max_dependents'
        },
        planId: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: 'plans',
                key: 'id'
            },
            onUpdate: 'CASCADE',
            onDelete: 'RESTRICT',
            field: 'plan_id'
        },
        subscriptionStartDate: {
            type: DataTypes.DATE,
            allowNull: false,
            field: 'subscription_start_date'
        },
        subscriptionEndDate: {
            type: DataTypes.DATE,
            allowNull: true,
            field: 'subscription_end_date'
        },
        soldByUserId: {
            type: DataTypes.UUID,
            allowNull: true,
            references: {
                model: 'admins',
                key: 'id'
            },
            onUpdate: 'CASCADE',
            onDelete: 'SET NULL',
            field: 'sold_by_user_id'
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
        tableName: 'retail_enrollees',
        timestamps: true,
        underscored: true,
        indexes: [
            {
                fields: ['email']
            },
            {
                fields: ['phone_number']
            },
            {
                fields: ['plan_id']
            },
            {
                fields: ['sold_by_user_id']
            }
        ]
    });

    return RetailEnrollee;
};
