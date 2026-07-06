'use strict';

module.exports = (sequelize, DataTypes) => {
    const Session = sequelize.define('Session', {
        id: {
            type: DataTypes.UUID,
            allowNull: false,
            primaryKey: true,
            defaultValue: DataTypes.UUIDV4,
            field: 'id'
        },
        sessionCode: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
            field: 'session_code'
        },
        doctorId: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: 'doctors',
                key: 'id'
            },
            onUpdate: 'CASCADE',
            onDelete: 'CASCADE',
            field: 'doctor_id'
        },
        enrolleeId: {
            type: DataTypes.UUID,
            allowNull: true,
            references: {
                model: 'enrollees',
                key: 'id'
            },
            onUpdate: 'CASCADE',
            onDelete: 'SET NULL',
            field: 'enrollee_id'
        },
        providerId: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: 'providers',
                key: 'id'
            },
            onUpdate: 'CASCADE',
            onDelete: 'CASCADE',
            field: 'provider_id'
        },
        sessionDate: {
            type: DataTypes.DATE,
            allowNull: false,
            field: 'session_date'
        },
        startTime: {
            type: DataTypes.TIME,
            allowNull: false,
            field: 'start_time'
        },
        endTime: {
            type: DataTypes.TIME,
            allowNull: false,
            field: 'end_time'
        },
        duration: {
            type: DataTypes.INTEGER,
            allowNull: false,
            comment: 'Duration in minutes',
            field: 'duration'
        },
        sessionType: {
            type: DataTypes.ENUM('in-person', 'virtual', 'phone'),
            allowNull: false,
            field: 'session_type'
        },
        status: {
            type: DataTypes.ENUM('scheduled', 'confirmed', 'in-progress', 'completed', 'cancelled', 'no-show', 'rescheduled'),
            allowNull: false,
            defaultValue: 'scheduled',
            field: 'status'
        },
        chiefComplaint: {
            type: DataTypes.TEXT,
            allowNull: true,
            field: 'chief_complaint'
        },
        notes: {
            type: DataTypes.TEXT,
            allowNull: true,
            field: 'notes'
        },
        consultationFee: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: true,
            field: 'consultation_fee'
        },
        feeStatus: {
            type: DataTypes.ENUM('pending', 'paid', 'waived'),
            allowNull: false,
            defaultValue: 'pending',
            field: 'fee_status'
        },
        paymentMethod: {
            type: DataTypes.ENUM('insurance', 'cash', 'online', 'transfer'),
            allowNull: true,
            field: 'payment_method'
        },
        prescription: {
            type: DataTypes.TEXT,
            allowNull: true,
            field: 'prescription'
        },
        diagnosis: {
            type: DataTypes.TEXT,
            allowNull: true,
            field: 'diagnosis'
        },
        followUpRequired: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
            field: 'follow_up_required'
        },
        followUpDate: {
            type: DataTypes.DATE,
            allowNull: true,
            field: 'follow_up_date'
        },
        cancellationReason: {
            type: DataTypes.TEXT,
            allowNull: true,
            field: 'cancellation_reason'
        },
        cancelledBy: {
            type: DataTypes.ENUM('doctor', 'enrollee', 'admin'),
            allowNull: true,
            field: 'cancelled_by'
        },
        cancelledAt: {
            type: DataTypes.DATE,
            allowNull: true,
            field: 'cancelled_at'
        },
        meetingLink: {
            type: DataTypes.STRING,
            allowNull: true,
            comment: 'For virtual sessions',
            field: 'meeting_link'
        },
        sessionLocation: {
            type: DataTypes.STRING,
            allowNull: true,
            field: 'session_location'
        },
        rating: {
            type: DataTypes.DECIMAL(3, 2),
            allowNull: true,
            field: 'rating'
        },
        ratingComment: {
            type: DataTypes.TEXT,
            allowNull: true,
            field: 'rating_comment'
        },
        ratedAt: {
            type: DataTypes.DATE,
            allowNull: true,
            field: 'rated_at'
        },
        remindersCount: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
            field: 'reminders_count'
        },
        lastReminderSentAt: {
            type: DataTypes.DATE,
            allowNull: true,
            field: 'last_reminder_sent_at'
        }
    }, {
        tableName: 'sessions',
        timestamps: true,
        underscored: true
    });

    return Session;
};
