'use strict';

module.exports = (sequelize, DataTypes) => {
    const AdminNotification = sequelize.define('AdminNotification', {
        id: {
            type: DataTypes.UUID,
            allowNull: false,
            primaryKey: true,
            defaultValue: DataTypes.UUIDV4,
            field: 'id'
        },
        userId: {
            type: DataTypes.UUID,
            allowNull: true,
            field: 'user_id'
        },
        title: {
            type: DataTypes.STRING,
            allowNull: false,
            field: 'title'
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
        }
    }, {
        tableName: 'admin_notifications',
        timestamps: true,
        underscored: true
    });

    return AdminNotification;
};
