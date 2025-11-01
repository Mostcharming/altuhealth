'use strict';

module.exports = (sequelize, DataTypes) => {
    const PolicyNumber = sequelize.define('PolicyNumber', {
        id: {
            type: DataTypes.UUID,
            allowNull: false,
            primaryKey: true,
            defaultValue: DataTypes.UUIDV4
        },
        policyNumber: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
        },
        providerName: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        userId: {
            type: DataTypes.UUID,
            allowNull: false,
        },
        userType: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        coverageDetails: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        validFrom: {
            type: DataTypes.DATE,
            allowNull: false,
        },
        validTo: {
            type: DataTypes.DATE,
            allowNull: false,
        },
    }, {
        tableName: 'policy_numbers',
        timestamps: true,
    });

    return PolicyNumber;
}