'use strict';

module.exports = (sequelize, DataTypes) => {
    const ClaimInfo = sequelize.define('ClaimInfo', {
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
        serviceDate: {
            type: DataTypes.DATE,
            allowNull: false,
            field: 'service_date'
        },
        claimAmount: {
            type: DataTypes.DECIMAL(15, 2),
            allowNull: false,
            defaultValue: 0,
            field: 'claim_amount'
        },
        approvedAmount: {
            type: DataTypes.DECIMAL(15, 2),
            allowNull: false,
            defaultValue: 0,
            field: 'approved_amount'
        },
        status: {
            type: DataTypes.ENUM('pending', 'approved', 'rejected', 'partially_approved', 'under_review'),
            allowNull: false,
            defaultValue: 'pending',
            field: 'status'
        },
        serviceType: {
            type: DataTypes.STRING,
            allowNull: true,
            field: 'service_type'
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: true,
            field: 'description'
        },
        notes: {
            type: DataTypes.TEXT,
            allowNull: true,
            field: 'notes'
        }
    }, {
        tableName: 'claim_infos',
        timestamps: true,
        underscored: true
    });

    return ClaimInfo;
};
