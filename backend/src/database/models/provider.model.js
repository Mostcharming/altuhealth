'use strict';

module.exports = (sequelize, DataTypes) => {
    const Provider = sequelize.define('Provider', {
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
        category: {
            type: DataTypes.ENUM('primary', 'secondary', 'tertiary', 'specialized'),
            allowNull: false,
            field: 'category'
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
        phoneNumber: {
            type: DataTypes.STRING,
            allowNull: false,
            field: 'phone_number'
        },
        secondaryPhoneNumber: {
            type: DataTypes.STRING,
            allowNull: true,
            field: 'secondary_phone_number'
        },
        website: {
            type: DataTypes.STRING,
            allowNull: true,
            field: 'website'
        },
        country: {
            type: DataTypes.STRING,
            allowNull: false,
            field: 'country'
        },
        state: {
            type: DataTypes.STRING,
            allowNull: false,
            field: 'state'
        },
        code: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
            field: 'code'
        },
        upn: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
            field: 'upn'
        },
        lga: {
            type: DataTypes.STRING,
            allowNull: true,
            field: 'lga'
        },
        address: {
            type: DataTypes.STRING,
            allowNull: false,
            field: 'address'
        },
        providerArea: {
            type: DataTypes.STRING,
            allowNull: true,
            field: 'provider_area'
        },
        bank: {
            type: DataTypes.STRING,
            allowNull: false,
            field: 'bank'
        },
        accountName: {
            type: DataTypes.STRING,
            allowNull: false,
            field: 'account_name'
        },
        accountNumber: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
            field: 'account_number'
        },
        bankBranch: {
            type: DataTypes.STRING,
            allowNull: true,
            field: 'bank_branch'
        },
        paymentBatch: {
            type: DataTypes.ENUM('batch_a', 'batch_b', 'batch_c', 'batch_d'),
            allowNull: true,
            defaultValue: null,
            field: 'payment_batch'
        },
        managerId: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: 'admins',
                key: 'id'
            },
            field: 'manager_id'
        },
        providerSpecializationId: {
            type: DataTypes.UUID,
            allowNull: true,
            references: {
                model: 'provider_specializations',
                key: 'id'
            },
            field: 'provider_specialization_id'
        },
        status: {
            type: DataTypes.ENUM('active', 'inactive', 'suspended', 'pending_approval'),
            allowNull: false,
            defaultValue: 'pending_approval',
            field: 'status'
        },
        isDeleted: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
            field: 'is_deleted'
        },
        password: {
            type: DataTypes.STRING,
            allowNull: true,
            field: 'password'
        }
    }, {
        tableName: 'providers',
        timestamps: true,
        underscored: true
    });

    return Provider;
};
