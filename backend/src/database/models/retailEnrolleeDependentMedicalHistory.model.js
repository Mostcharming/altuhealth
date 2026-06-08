'use strict';

module.exports = (sequelize, DataTypes) => {
    const RetailEnrolleeDependentMedicalHistory = sequelize.define('RetailEnrolleeDependentMedicalHistory', {
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
        providerId: {
            type: DataTypes.UUID,
            allowNull: true,
            references: {
                model: 'providers',
                key: 'id'
            },
            onUpdate: 'CASCADE',
            onDelete: 'SET NULL',
            field: 'provider_id'
        },
        diagnosisId: {
            type: DataTypes.UUID,
            allowNull: true,
            references: {
                model: 'diagnoses',
                key: 'id'
            },
            onUpdate: 'CASCADE',
            onDelete: 'SET NULL',
            field: 'diagnosis_id'
        },
        evsCode: {
            type: DataTypes.STRING,
            allowNull: true,
            field: 'evs_code'
        },
        amount: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: true,
            field: 'amount'
        },
        serviceDate: {
            type: DataTypes.DATE,
            allowNull: true,
            field: 'service_date'
        },
        notes: {
            type: DataTypes.TEXT,
            allowNull: true,
            field: 'notes'
        },
        attachmentUrl: {
            type: DataTypes.STRING,
            allowNull: true,
            field: 'attachment_url'
        },
        status: {
            type: DataTypes.ENUM('pending', 'reviewed', 'approved', 'rejected'),
            allowNull: false,
            defaultValue: 'pending',
            field: 'status'
        },
        currency: {
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: 'NGN',
            field: 'currency'
        }
    }, {
        tableName: 'retail_enrollee_dependent_medical_histories',
        timestamps: true,
        underscored: true
    });

    return RetailEnrolleeDependentMedicalHistory;
};
