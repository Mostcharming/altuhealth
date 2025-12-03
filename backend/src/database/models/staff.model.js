'use strict';

module.exports = (sequelize, DataTypes) => {
    const Staff = sequelize.define('Staff', {
        id: {
            type: DataTypes.UUID,
            allowNull: false,
            primaryKey: true,
            defaultValue: DataTypes.UUIDV4,
            field: 'id'
        },
        firstName: {
            type: DataTypes.STRING,
            allowNull: false,
            field: 'first_name'
        },
        middleName: {
            type: DataTypes.STRING,
            allowNull: true,
            field: 'middle_name'
        },
        lastName: {
            type: DataTypes.STRING,
            allowNull: false,
            field: 'last_name'
        },
        dateOfBirth: {
            type: DataTypes.DATE,
            allowNull: true,
            field: 'date_of_birth'
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
            validate: {
                isEmail: true
            },
            field: 'email'
        },
        phoneNumber: {
            type: DataTypes.STRING,
            allowNull: false,
            field: 'phone_number'
        },
        staffId: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
            field: 'staff_id'
        },
        companyId: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: 'companies',
                key: 'id'
            },
            onUpdate: 'CASCADE',
            onDelete: 'RESTRICT',
            field: 'company_id'
        },
        subsidiaryId: {
            type: DataTypes.UUID,
            allowNull: true,
            references: {
                model: 'company_subsidiaries',
                key: 'id'
            },
            onUpdate: 'CASCADE',
            onDelete: 'SET NULL',
            field: 'subsidiary_id'
        },
        enrollmentStatus: {
            type: DataTypes.ENUM('enrolled', 'not_enrolled'),
            allowNull: false,
            defaultValue: 'not_enrolled',
            field: 'enrollment_status'
        },
        isNotified: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
            field: 'is_notified'
        },
        notifiedAt: {
            type: DataTypes.DATE,
            allowNull: true,
            field: 'notified_at'
        },
        isActive: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: true,
            field: 'is_active'
        },
        maxDependents: {
            type: DataTypes.INTEGER,
            allowNull: true,
            field: 'max_dependents'
        },
        preexistingMedicalRecords: {
            type: DataTypes.TEXT,
            allowNull: true,
            field: 'preexisting_medical_records'
        },
        companyPlanId: {
            type: DataTypes.UUID,
            allowNull: true,
            references: {
                model: 'company_plans',
                key: 'id'
            },
            onUpdate: 'CASCADE',
            onDelete: 'SET NULL',
            field: 'company_plan_id'
        }
    }, {
        tableName: 'staffs',
        timestamps: true,
        underscored: true
    });

    return Staff;
};
