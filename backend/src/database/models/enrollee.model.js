'use strict';

module.exports = (sequelize, DataTypes) => {
    const Enrollee = sequelize.define('Enrollee', {
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
        policyNumber: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
            field: 'policy_number'
        },
        staffId: {
            type: DataTypes.UUID,
            allowNull: false,
            unique: true,
            references: {
                model: 'staffs',
                key: 'id'
            },
            onUpdate: 'CASCADE',
            onDelete: 'CASCADE',
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
        companyPlanId: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: 'company_plans',
                key: 'id'
            },
            onUpdate: 'CASCADE',
            onDelete: 'RESTRICT',
            field: 'company_plan_id'
        },
        dateOfBirth: {
            type: DataTypes.DATE,
            allowNull: false,
            field: 'date_of_birth'
        },
        state: {
            type: DataTypes.STRING,
            allowNull: true,
            field: 'state'
        },
        lga: {
            type: DataTypes.STRING,
            allowNull: true,
            field: 'lga'
        },
        address: {
            type: DataTypes.TEXT,
            allowNull: true,
            field: 'address'
        },
        occupation: {
            type: DataTypes.STRING,
            allowNull: true,
            field: 'occupation'
        },
        maritalStatus: {
            type: DataTypes.ENUM('single', 'married', 'divorced', 'widowed', 'separated'),
            allowNull: true,
            field: 'marital_status'
        },
        gender: {
            type: DataTypes.ENUM('male', 'female', 'other'),
            allowNull: false,
            field: 'gender'
        },
        phoneNumber: {
            type: DataTypes.STRING,
            allowNull: false,
            field: 'phone_number'
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                isEmail: true
            },
            field: 'email'
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
        enrollmentDate: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
            field: 'enrollment_date'
        },
        expirationDate: {
            type: DataTypes.DATE,
            allowNull: true,
            field: 'expiration_date'
        },
        pictureUrl: {
            type: DataTypes.STRING,
            allowNull: true,
            field: 'picture_url'
        },
        idCardUrl: {
            type: DataTypes.STRING,
            allowNull: true,
            field: 'id_card_url'
        },
        isVerified: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
            field: 'is_verified'
        },
        verificationCode: {
            type: DataTypes.STRING,
            allowNull: true,
            unique: true,
            field: 'verification_code'
        },
        verificationCodeExpiresAt: {
            type: DataTypes.DATE,
            allowNull: true,
            field: 'verification_code_expires_at'
        },
        verifiedAt: {
            type: DataTypes.DATE,
            allowNull: true,
            field: 'verified_at'
        },
        verificationAttempts: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
            field: 'verification_attempts'
        },
        isActive: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: true,
            field: 'is_active'
        }
    }, {
        tableName: 'enrollees',
        timestamps: true,
        underscored: true
    });

    return Enrollee;
};
