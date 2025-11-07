'use strict';

module.exports = (sequelize, DataTypes) => {
    const GeneralSetting = sequelize.define('GeneralSetting', {
        id: {
            type: DataTypes.UUID,
            allowNull: false,
            primaryKey: true,
            defaultValue: DataTypes.UUIDV4
        },
        emailFrom: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        smsFrom: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        emailTemplate: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        smsBody: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        mailConfig: {
            type: DataTypes.JSON,
            allowNull: true,
        },
        smsConfig: {
            type: DataTypes.JSON,
            allowNull: true,
        }
    }, {
        tableName: 'general_settings',
        timestamps: true,
        underscored: true,
    });

    return GeneralSetting;
};
