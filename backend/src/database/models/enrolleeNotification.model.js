'use strict';

module.exports = (sequelize, DataTypes) => {
    const EnrolleeNotification = sequelize.define('EnrolleeNotification', {
        id: {
            type: DataTypes.UUID,
            allowNull: false,
            primaryKey: true,
            defaultValue: DataTypes.UUIDV4,
            field: 'id'
        },
        enrolleeId: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: 'enrollees',
                key: 'id'
            },
            onUpdate: 'CASCADE',
            onDelete: 'CASCADE',
            field: 'enrollee_id'
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
        tableName: 'enrollee_notifications',
        timestamps: true,
        underscored: true
    });

    return EnrolleeNotification;
};
