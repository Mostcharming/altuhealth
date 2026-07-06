'use strict';

module.exports = (sequelize, DataTypes) => {
    const AdmissionTracker = sequelize.define('AdmissionTracker', {
        id: {
            type: DataTypes.UUID,
            allowNull: false,
            primaryKey: true,
            defaultValue: DataTypes.UUIDV4,
            field: 'id'
        },
        enrolleeId: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: 'enrollees',
                key: 'id'
            },
            field: 'enrollee_id'
        },
        providerId: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: 'providers',
                key: 'id'
            },
            field: 'provider_id'
        },
        companyId: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: 'companies',
                key: 'id'
            },
            field: 'company_id'
        },
        subsidiaryId: {
            type: DataTypes.UUID,
            allowNull: true,
            references: {
                model: 'company_subsidiaries',
                key: 'id'
            },
            field: 'subsidiary_id'
        },
        admissionDate: {
            type: DataTypes.DATE,
            allowNull: false,
            field: 'admission_date'
        },
        dischargeDate: {
            type: DataTypes.DATE,
            allowNull: true,
            field: 'discharge_date'
        },
        daysOfAdmission: {
            type: DataTypes.INTEGER,
            allowNull: true,
            field: 'days_of_admission'
        },
        diagnosis: {
            type: DataTypes.TEXT,
            allowNull: true,
            field: 'diagnosis'
        },
        diagnosisCode: {
            type: DataTypes.STRING,
            allowNull: true,
            field: 'diagnosis_code'
        },
        roomType: {
            type: DataTypes.STRING,
            allowNull: true,
            field: 'room_type'
        },
        bedNumber: {
            type: DataTypes.STRING,
            allowNull: true,
            field: 'bed_number'
        },
        ward: {
            type: DataTypes.STRING,
            allowNull: true,
            field: 'ward'
        },
        reasonForAdmission: {
            type: DataTypes.TEXT,
            allowNull: true,
            field: 'reason_for_admission'
        },
        treatmentNotes: {
            type: DataTypes.TEXT,
            allowNull: true,
            field: 'treatment_notes'
        },
        dischargeNotes: {
            type: DataTypes.TEXT,
            allowNull: true,
            field: 'discharge_notes'
        },
        admittingPhysician: {
            type: DataTypes.STRING,
            allowNull: true,
            field: 'admitting_physician'
        },
        dischargingPhysician: {
            type: DataTypes.STRING,
            allowNull: true,
            field: 'discharging_physician'
        },
        status: {
            type: DataTypes.ENUM('admitted', 'discharged', 'transferred', 'absconded', 'expired'),
            allowNull: false,
            defaultValue: 'admitted',
            field: 'status'
        },
        totalBillAmount: {
            type: DataTypes.DECIMAL(15, 2),
            allowNull: true,
            defaultValue: 0,
            field: 'total_bill_amount'
        },
        approvedAmount: {
            type: DataTypes.DECIMAL(15, 2),
            allowNull: true,
            defaultValue: 0,
            field: 'approved_amount'
        },
        approvedBy: {
            type: DataTypes.UUID,
            allowNull: true,
            references: {
                model: 'admins',
                key: 'id'
            },
            field: 'approved_by'
        },
        notes: {
            type: DataTypes.TEXT,
            allowNull: true,
            field: 'notes'
        }
    }, {
        tableName: 'admission_trackers',
        timestamps: true,
        underscored: true
    });

    return AdmissionTracker;
};
