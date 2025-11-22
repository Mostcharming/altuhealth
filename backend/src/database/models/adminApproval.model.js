'use strict';

module.exports = (sequelize, DataTypes) => {
    const AdminApproval = sequelize.define('AdminApproval', {
        id: {
            type: DataTypes.UUID,
            allowNull: false,
            primaryKey: true,
            defaultValue: DataTypes.UUIDV4,
            field: 'id'
        },
        model: {
            type: DataTypes.STRING,
            allowNull: false,
            field: 'model'
        },
        modelId: {
            type: DataTypes.UUID,
            allowNull: false,
            field: 'model_id'
        },
        action: {
            type: DataTypes.ENUM('create', 'update', 'delete', 'other'),
            allowNull: false,
            defaultValue: 'other',
            field: 'action'
        },
        details: {
            type: DataTypes.JSON,
            allowNull: true,
            field: 'details'
        },
        status: {
            type: DataTypes.ENUM('pending', 'approved', 'declined'),
            allowNull: false,
            defaultValue: 'pending',
            field: 'status'
        },
        requestedBy: {
            type: DataTypes.UUID,
            allowNull: false,
            field: 'requested_by'
        },
        requestedByType: {
            type: DataTypes.STRING,
            allowNull: true,
            defaultValue: 'Admin',
            field: 'requested_by_type'
        },
        actionedBy: {
            type: DataTypes.UUID,
            allowNull: true,
            field: 'actioned_by'
        },
        actionedByType: {
            type: DataTypes.STRING,
            allowNull: true,
            field: 'actioned_by_type'
        },
        comments: {
            type: DataTypes.TEXT,
            allowNull: true,
            field: 'comments'
        },
        meta: {
            type: DataTypes.JSON,
            allowNull: true,
            field: 'meta'
        },
        dueAt: {
            type: DataTypes.DATE,
            allowNull: true,
            field: 'due_at'
        },
        isDeleted: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
            field: 'is_deleted'
        }
    }, {
        tableName: 'admin_approvals',
        timestamps: true,
        underscored: true,
        indexes: [
            { fields: ['model', 'model_id'] },
            { fields: ['status'] },
            { fields: ['requested_by'] }
        ]
    });

    return AdminApproval;
};
