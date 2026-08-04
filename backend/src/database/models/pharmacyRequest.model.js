'use strict';

module.exports = (sequelize, DataTypes) => {
    return sequelize.define('PharmacyRequest', {
        id: {
            type: DataTypes.UUID,
            allowNull: false,
            primaryKey: true,
            defaultValue: DataTypes.UUIDV4
        },
        requestNumber: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
            field: 'request_number'
        },
        memberType: {
            type: DataTypes.ENUM('corporate', 'retail'),
            allowNull: false,
            field: 'member_type'
        },
        enrolleeId: {
            type: DataTypes.UUID,
            allowNull: true,
            field: 'enrollee_id'
        },
        retailEnrolleeId: {
            type: DataTypes.UUID,
            allowNull: true,
            field: 'retail_enrollee_id'
        },
        pharmacyName: {
            type: DataTypes.STRING,
            allowNull: false,
            field: 'pharmacy_name'
        },
        pharmacyPhone: {
            type: DataTypes.STRING,
            allowNull: true,
            field: 'pharmacy_phone'
        },
        pharmacyAddress: {
            type: DataTypes.TEXT,
            allowNull: true,
            field: 'pharmacy_address'
        },
        purchaseDate: {
            type: DataTypes.DATEONLY,
            allowNull: false,
            field: 'purchase_date'
        },
        amountClaimed: {
            type: DataTypes.DECIMAL(15, 2),
            allowNull: false,
            field: 'amount_claimed'
        },
        approvedAmount: {
            type: DataTypes.DECIMAL(15, 2),
            allowNull: true,
            field: 'approved_amount'
        },
        currency: {
            type: DataTypes.STRING(3),
            allowNull: false,
            defaultValue: 'NGN'
        },
        receiptUrl: {
            type: DataTypes.STRING,
            allowNull: true,
            field: 'receipt_url'
        },
        callReference: {
            type: DataTypes.STRING,
            allowNull: true,
            field: 'call_reference'
        },
        notes: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        status: {
            type: DataTypes.ENUM('pending', 'approved', 'rejected', 'paid'),
            allowNull: false,
            defaultValue: 'pending'
        },
        reviewNotes: {
            type: DataTypes.TEXT,
            allowNull: true,
            field: 'review_notes'
        },
        rejectionReason: {
            type: DataTypes.TEXT,
            allowNull: true,
            field: 'rejection_reason'
        },
        createdBy: {
            type: DataTypes.UUID,
            allowNull: true,
            field: 'created_by'
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
        paidAt: {
            type: DataTypes.DATE,
            allowNull: true,
            field: 'paid_at'
        }
    }, {
        tableName: 'pharmacy_requests',
        timestamps: true,
        underscored: true
    });
};
