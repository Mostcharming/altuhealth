'use strict';

module.exports = (sequelize, DataTypes) => {
    const Claim = sequelize.define('Claim', {
        id: {
            type: DataTypes.UUID,
            allowNull: false,
            primaryKey: true,
            defaultValue: DataTypes.UUIDV4,
            field: 'id'
        },
        providerId: {
            type: DataTypes.UUID,
            allowNull: false,
            field: 'provider_id'
        },
        numberOfEncounters: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
            field: 'number_of_encounters'
        },
        amountSubmitted: {
            type: DataTypes.DECIMAL(15, 2),
            allowNull: false,
            defaultValue: 0,
            field: 'amount_submitted'
        },
        amountProcessed: {
            type: DataTypes.DECIMAL(15, 2),
            allowNull: false,
            defaultValue: 0,
            field: 'amount_processed'
        },
        difference: {
            type: DataTypes.DECIMAL(15, 2),
            allowNull: false,
            defaultValue: 0,
            field: 'difference'
        },
        year: {
            type: DataTypes.INTEGER,
            allowNull: false,
            field: 'year'
        },
        month: {
            type: DataTypes.INTEGER,
            allowNull: false,
            field: 'month',
            validate: {
                min: 1,
                max: 12
            }
        },
        dateSubmitted: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
            field: 'date_submitted'
        },
        datePaid: {
            type: DataTypes.DATE,
            allowNull: true,
            field: 'date_paid'
        },
        bankUsedForPayment: {
            type: DataTypes.STRING,
            allowNull: true,
            field: 'bank_used_for_payment'
        },
        bankAccountNumber: {
            type: DataTypes.STRING,
            allowNull: true,
            field: 'bank_account_number'
        },
        accountName: {
            type: DataTypes.STRING,
            allowNull: true,
            field: 'account_name'
        },
        paymentBatchId: {
            type: DataTypes.UUID,
            allowNull: true,
            field: 'payment_batch_id'
        },
        submittedByType: {
            type: DataTypes.ENUM('Admin', 'Enrollee', 'Provider', 'Staff'),
            allowNull: false,
            field: 'submitted_by_type'
        },
        submittedById: {
            type: DataTypes.UUID,
            allowNull: false,
            field: 'submitted_by_id'
        },
        status: {
            type: DataTypes.ENUM(
                'draft',
                'submitted',
                'pending_vetting',
                'under_review',
                'awaiting_payment',
                'paid',
                'rejected',
                'partially_paid',
                'queried'
            ),
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
        claimReference: {
            type: DataTypes.STRING,
            allowNull: true,
            unique: true,
            field: 'claim_reference'
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: true,
            field: 'description'
        },
        attachmentUrl: {
            type: DataTypes.STRING,
            allowNull: true,
            field: 'attachment_url'
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
        tableName: 'claims',
        timestamps: false
    });

    return Claim;
};
