'use strict';

module.exports = (sequelize, DataTypes) => {
    const RetailEnrolleeDependentNotification = sequelize.define('RetailEnrolleeDependentNotification', {
        id: {
            type: DataTypes.UUID,
            allowNull: false,
            primaryKey: true,
            defaultValue: DataTypes.UUIDV4,
            field: 'id'
        },
        retailEnrolleeDependentId: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: 'retail_enrollee_dependents',
                key: 'id'
            },
            onUpdate: 'CASCADE',
            onDelete: 'CASCADE',
            field: 'retail_enrollee_dependent_id'
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
        tableName: 'retail_enrollee_dependent_notifications',
        timestamps: true,
        underscored: true
    });

    return RetailEnrolleeDependentNotification;
};
