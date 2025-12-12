'use strict';

module.exports = (sequelize, DataTypes) => {
    const Appointment = sequelize.define('Appointment', {
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
        complaint: {
            type: DataTypes.TEXT,
            allowNull: true,
            field: 'complaint'
        },
        appointmentDateTime: {
            type: DataTypes.DATE,
            allowNull: false,
            field: 'appointment_date_time'
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
        rejectedBy: {
            type: DataTypes.UUID,
            allowNull: true,
            references: {
                model: 'admins',
                key: 'id'
            },
            field: 'rejected_by'
        },
        rejectionReason: {
            type: DataTypes.TEXT,
            allowNull: true,
            field: 'rejection_reason'
        },
        status: {
            type: DataTypes.ENUM('pending', 'approved', 'rejected', 'attended', 'missed', 'cancelled', 'rescheduled'),
            allowNull: false,
            defaultValue: 'pending',
            field: 'status'
        },
        notes: {
            type: DataTypes.TEXT,
            allowNull: true,
            field: 'notes'
        }
    }, {
        tableName: 'appointments',
        timestamps: true,
        underscored: true
    });

    return Appointment;
};
