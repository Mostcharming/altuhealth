'use strict';

module.exports = (sequelize, DataTypes) => {
    const AuditLog = sequelize.define('AuditLog', {
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
        userType: {
            type: DataTypes.STRING,
            allowNull: true,
            field: 'user_type'
        },
        action: {
            type: DataTypes.STRING,
            allowNull: false,
            field: 'action'
        },
        message: {
            type: DataTypes.TEXT,
            allowNull: false,
            field: 'message'
        },
        meta: {
            type: DataTypes.JSON,
            allowNull: true,
            field: 'meta'
        }
    }, {
        tableName: 'audit_logs',
        timestamps: true,
        underscored: true
    });

    return AuditLog;
};
