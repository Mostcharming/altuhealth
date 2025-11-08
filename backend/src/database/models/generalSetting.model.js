'use strict';

module.exports = (sequelize, DataTypes) => {
    const GeneralSetting = sequelize.define('GeneralSetting', {
        id: {
            type: DataTypes.UUID,
            allowNull: false,
            primaryKey: true,
            defaultValue: DataTypes.UUIDV4,
            field: 'id'
        },
        emailFrom: {
            type: DataTypes.STRING,
            allowNull: true,
            field: 'email_from'
        },
        smsFrom: {
            type: DataTypes.STRING,
            allowNull: true,
            field: 'sms_from'
        },
        emailTemplate: {
            type: DataTypes.TEXT,
            allowNull: true,
            field: 'email_template'
        },
        smsBody: {
            type: DataTypes.TEXT,
            allowNull: true,
            field: 'sms_body'
        },
        mailConfig: {
            type: DataTypes.JSON,
            allowNull: true,
            field: 'mail_config'
        },
        smsConfig: {
            type: DataTypes.JSON,
            allowNull: true,
            field: 'sms_config'
        }
    }, {
        tableName: 'general_settings',
        timestamps: true,
        underscored: true,
    });

    return GeneralSetting;
};
