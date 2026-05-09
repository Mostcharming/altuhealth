'use strict';

module.exports = (sequelize, DataTypes) => {
    const PolicyNumber = sequelize.define('PolicyNumber', {
        id: {
            type: DataTypes.UUID,
            allowNull: false,
            primaryKey: true,
            defaultValue: DataTypes.UUIDV4,
            field: 'id'
        },
        policyNumber: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
            field: 'policy_number'
        },
        providerName: {
            type: DataTypes.STRING,
            allowNull: false,
            field: 'provider_name'
        },
        userId: {
            type: DataTypes.UUID,
            allowNull: false,
            field: 'user_id'
        },
        userType: {
            type: DataTypes.STRING,
            allowNull: false,
            field: 'user_type'
        },
        coverageDetails: {
            type: DataTypes.TEXT,
            allowNull: true,
            field: 'coverage_details'
        },
        validFrom: {
            type: DataTypes.DATE,
            allowNull: false,
            field: 'valid_from'
        },
        validTo: {
            type: DataTypes.DATE,
            allowNull: false,
            field: 'valid_to'
        },
    }, {
        tableName: 'policy_numbers',
        timestamps: true,
        underscored: true
    });

    return PolicyNumber;
}