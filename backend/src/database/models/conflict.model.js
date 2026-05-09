'use strict';

module.exports = (sequelize, DataTypes) => {
    const Conflict = sequelize.define('Conflict', {
        id: {
            type: DataTypes.UUID,
            allowNull: false,
            primaryKey: true,
            defaultValue: DataTypes.UUIDV4,
            field: 'id'
        },
        paymentBatchDetailId: {
            type: DataTypes.UUID,
            allowNull: false,
            field: 'payment_batch_detail_id'
        },
        enrolleeId: {
            type: DataTypes.UUID,
            allowNull: false,
            field: 'enrollee_id'
        },
        claimNumber: {
            type: DataTypes.STRING,
            allowNull: false,
            field: 'claim_number'
        },
        conflictType: {
            type: DataTypes.ENUM('amount_mismatch', 'duplicate_claim', 'missing_documentation', 'coverage_issue', 'other'),
            allowNull: false,
            field: 'conflict_type'
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: false,
            field: 'description'
        },
        claimedAmount: {
            type: DataTypes.DECIMAL(15, 2),
            allowNull: false,
            defaultValue: 0,
            field: 'claimed_amount'
        },
        resolvedAmount: {
            type: DataTypes.DECIMAL(15, 2),
            allowNull: true,
            defaultValue: 0,
            field: 'resolved_amount'
        },
        resolutionComment: {
            type: DataTypes.TEXT,
            allowNull: true,
            field: 'resolution_comment'
        },
        status: {
            type: DataTypes.ENUM('open', 'in_progress', 'resolved', 'escalated'),
            allowNull: false,
            defaultValue: 'open',
            field: 'status'
        },
        assignedTo: {
            type: DataTypes.UUID,
            allowNull: true,
            field: 'assigned_to'
        },
        resolvedDate: {
            type: DataTypes.DATE,
            allowNull: true,
            field: 'resolved_date'
        },
        notes: {
            type: DataTypes.TEXT,
            allowNull: true,
            field: 'notes'
        }
    }, {
        tableName: 'conflicts',
        timestamps: true,
        underscored: true
    });

    return Conflict;
};
