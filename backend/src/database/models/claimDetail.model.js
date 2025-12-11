'use strict';

module.exports = (sequelize, DataTypes) => {
    const ClaimDetail = sequelize.define('ClaimDetail', {
        id: {
            type: DataTypes.UUID,
            allowNull: false,
            primaryKey: true,
            defaultValue: DataTypes.UUIDV4,
            field: 'id'
        },
        claimId: {
            type: DataTypes.UUID,
            allowNull: false,
            field: 'claim_id'
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
        companyId: {
            type: DataTypes.UUID,
            allowNull: true,
            field: 'company_id'
        },
        providerId: {
            type: DataTypes.UUID,
            allowNull: false,
            field: 'provider_id'
        },
        diagnosisId: {
            type: DataTypes.UUID,
            allowNull: true,
            field: 'diagnosis_id'
        },
        serviceDate: {
            type: DataTypes.DATE,
            allowNull: false,
            field: 'service_date'
        },
        dischargeDate: {
            type: DataTypes.DATE,
            allowNull: true,
            field: 'discharge_date'
        },
        serviceType: {
            type: DataTypes.ENUM('outpatient', 'inpatient', 'emergency', 'procedure', 'consultation', 'diagnostic', 'laboratory', 'pharmacy', 'dental', 'optical'),
            allowNull: false,
            field: 'service_type'
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: true,
            field: 'description'
        },
        amountSubmitted: {
            type: DataTypes.DECIMAL(15, 2),
            allowNull: false,
            defaultValue: 0,
            field: 'amount_submitted'
        },
        amountApproved: {
            type: DataTypes.DECIMAL(15, 2),
            allowNull: false,
            defaultValue: 0,
            field: 'amount_approved'
        },
        amountRejected: {
            type: DataTypes.DECIMAL(15, 2),
            allowNull: false,
            defaultValue: 0,
            field: 'amount_rejected'
        },
        quantity: {
            type: DataTypes.INTEGER,
            allowNull: true,
            defaultValue: 1,
            field: 'quantity'
        },
        unitPrice: {
            type: DataTypes.DECIMAL(15, 2),
            allowNull: true,
            field: 'unit_price'
        },
        procedureCode: {
            type: DataTypes.STRING,
            allowNull: true,
            field: 'procedure_code'
        },
        procedureName: {
            type: DataTypes.STRING,
            allowNull: true,
            field: 'procedure_name'
        },
        medicationCode: {
            type: DataTypes.STRING,
            allowNull: true,
            field: 'medication_code'
        },
        medicationName: {
            type: DataTypes.STRING,
            allowNull: true,
            field: 'medication_name'
        },
        authorizationCode: {
            type: DataTypes.STRING,
            allowNull: true,
            field: 'authorization_code'
        },
        referralCode: {
            type: DataTypes.STRING,
            allowNull: true,
            field: 'referral_code'
        },
        status: {
            type: DataTypes.ENUM('draft', 'submitted', 'approved', 'partially_approved', 'rejected', 'queried'),
            allowNull: false,
            defaultValue: 'draft',
            field: 'status'
        },
        rejectionReason: {
            type: DataTypes.TEXT,
            allowNull: true,
            field: 'rejection_reason'
        },
        vetterNotes: {
            type: DataTypes.TEXT,
            allowNull: true,
            field: 'vetter_notes'
        },
        attachmentUrl: {
            type: DataTypes.STRING,
            allowNull: true,
            field: 'attachment_url'
        },
        inpatientDays: {
            type: DataTypes.INTEGER,
            allowNull: true,
            field: 'inpatient_days'
        },
        createdAt: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
            field: 'created_at'
        },
        updatedAt: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
            field: 'updated_at'
        }
    }, {
        tableName: 'claim_details',
        timestamps: false
    });

    return ClaimDetail;
};
