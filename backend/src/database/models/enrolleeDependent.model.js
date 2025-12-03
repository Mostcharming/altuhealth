'use strict';

module.exports = (sequelize, DataTypes) => {
    const EnrolleeDependent = sequelize.define('EnrolleeDependent', {
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
            onUpdate: 'CASCADE',
            onDelete: 'CASCADE',
            field: 'enrollee_id'
        },
        policyNumber: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
            field: 'policy_number'
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
            allowNull: false,
            field: 'date_of_birth'
        },
        gender: {
            type: DataTypes.ENUM('male', 'female', 'other'),
            allowNull: false,
            field: 'gender'
        },
        relationshipToEnrollee: {
            type: DataTypes.ENUM('spouse', 'child', 'parent', 'sibling', 'other'),
            allowNull: false,
            field: 'relationship_to_enrollee'
        },
        phoneNumber: {
            type: DataTypes.STRING,
            allowNull: true,
            field: 'phone_number'
        },
        email: {
            type: DataTypes.STRING,
            allowNull: true,
            validate: {
                isEmail: true
            },
            field: 'email'
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
        preexistingMedicalRecords: {
            type: DataTypes.TEXT,
            allowNull: true,
            field: 'preexisting_medical_records'
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
        isActive: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: true,
            field: 'is_active'
        },
        notes: {
            type: DataTypes.TEXT,
            allowNull: true,
            field: 'notes'
        }
    }, {
        tableName: 'enrollee_dependents',
        timestamps: true,
        underscored: true
    });

    return EnrolleeDependent;
};
