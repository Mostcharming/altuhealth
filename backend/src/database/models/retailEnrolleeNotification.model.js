'use strict';

module.exports = (sequelize, DataTypes) => {
    const RetailEnrolleeNotification = sequelize.define('RetailEnrolleeNotification', {
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
        title: {
            type: DataTypes.STRING,
            allowNull: false,
            field: 'title'
        },
        message: {
            type: DataTypes.TEXT,
            allowNull: true,
            field: 'message'
        },
        isRead: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
            field: 'is_read'
        },
        clickUrl: {
            type: DataTypes.STRING,
            allowNull: true,
            field: 'click_url'
        },
        notificationType: {
            type: DataTypes.STRING,
            allowNull: true,
            field: 'notification_type'
        }
    }, {
        tableName: 'retail_enrollee_notifications',
        timestamps: true,
        underscored: true
    });

    return RetailEnrolleeNotification;
};
