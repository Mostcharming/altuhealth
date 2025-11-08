'use strict';

module.exports = (sequelize, DataTypes) => {
    const Notification = sequelize.define('Notification', {
        id: {
            type: DataTypes.UUID,
            allowNull: false,
            primaryKey: true,
            defaultValue: DataTypes.UUIDV4,
            field: 'id'
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
        sentTo: {
            type: DataTypes.STRING,
            allowNull: false,
            field: 'sent_to'
        },
        subject: {
            type: DataTypes.STRING,
            allowNull: true,
            field: 'subject'
        },
        message: {
            type: DataTypes.TEXT,
            allowNull: true,
            field: 'message'
        },
        notificationType: {
            type: DataTypes.STRING,
            allowNull: false,
            field: 'notification_type'
        }
    }, {
        tableName: 'notification_logs',
        timestamps: true,
        underscored: true
    });

    return Notification;
};
