'use strict';

module.exports = (sequelize, DataTypes) => {
    const AccountDeletionRequest = sequelize.define('AccountDeletionRequest', {
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
            field: 'user_type',
            validate: { isIn: [['Enrollee', 'RetailEnrollee']] }
        },
        reason: {
            type: DataTypes.TEXT,
            allowNull: false,
            field: 'reason'
        },
        status: {
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: 'pending',
            field: 'status',
            validate: { isIn: [['pending', 'approved', 'declined', 'cancelled', 'archived']] }
        },
        adminNote: {
            type: DataTypes.TEXT,
            allowNull: true,
            field: 'admin_note'
        },
        reviewedBy: {
            type: DataTypes.UUID,
            allowNull: true,
            field: 'reviewed_by'
        },
        reviewedAt: {
            type: DataTypes.DATE,
            allowNull: true,
            field: 'reviewed_at'
        },
        approvedAt: {
            type: DataTypes.DATE,
            allowNull: true,
            field: 'approved_at'
        },
        retentionExpiresAt: {
            type: DataTypes.DATE,
            allowNull: true,
            field: 'retention_expires_at'
        },
        cancelledAt: {
            type: DataTypes.DATE,
            allowNull: true,
            field: 'cancelled_at'
        },
        archivedAt: {
            type: DataTypes.DATE,
            allowNull: true,
            field: 'archived_at'
        }
    }, {
        tableName: 'account_deletion_requests',
        timestamps: true,
        underscored: true,
        indexes: [
            { fields: ['user_id', 'user_type'] },
            { fields: ['status'] },
            { fields: ['retention_expires_at'] }
        ]
    });

    return AccountDeletionRequest;
};
