'use strict';

module.exports = (sequelize, DataTypes) => {
    const Doctor = sequelize.define('Doctor', {
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
        specialization: {
            type: DataTypes.STRING,
            allowNull: false,
            field: 'specialization'
        },
        licenseNumber: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
            field: 'license_number'
        },
        licenseExpiryDate: {
            type: DataTypes.DATE,
            allowNull: true,
            field: 'license_expiry_date'
        },
        registrationNumber: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
            field: 'registration_number'
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
        address: {
            type: DataTypes.TEXT,
            allowNull: true,
            field: 'address'
        },
        state: {
            type: DataTypes.STRING,
            allowNull: true,
            field: 'state'
        },
        country: {
            type: DataTypes.STRING,
            allowNull: true,
            field: 'country'
        },
        lga: {
            type: DataTypes.STRING,
            allowNull: true,
            field: 'lga'
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
        yearsOfExperience: {
            type: DataTypes.INTEGER,
            allowNull: true,
            field: 'years_of_experience'
        },
        bio: {
            type: DataTypes.TEXT,
            allowNull: true,
            field: 'bio'
        },
        profilePictureUrl: {
            type: DataTypes.STRING,
            allowNull: true,
            field: 'profile_picture_url'
        },
        consultationFee: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: true,
            field: 'consultation_fee'
        },
        isAvailable: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: true,
            field: 'is_available'
        },
        availableFrom: {
            type: DataTypes.TIME,
            allowNull: true,
            comment: 'Daily availability start time (HH:MM:SS format)',
            field: 'available_from'
        },
        availableTo: {
            type: DataTypes.TIME,
            allowNull: true,
            comment: 'Daily availability end time (HH:MM:SS format)',
            field: 'available_to'
        },
        availableDays: {
            type: DataTypes.JSON,
            allowNull: true,
            comment: 'Days of week when doctor is available (e.g., ["monday", "tuesday", "wednesday", "thursday", "friday"])',
            field: 'available_days'
        },
        breakStartTime: {
            type: DataTypes.TIME,
            allowNull: true,
            comment: 'Daily break start time (HH:MM:SS format)',
            field: 'break_start_time'
        },
        breakEndTime: {
            type: DataTypes.TIME,
            allowNull: true,
            comment: 'Daily break end time (HH:MM:SS format)',
            field: 'break_end_time'
        },
        averageRating: {
            type: DataTypes.DECIMAL(3, 2),
            allowNull: true,
            defaultValue: 0,
            field: 'average_rating'
        },
        totalRatings: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
            field: 'total_ratings'
        },
        status: {
            type: DataTypes.ENUM('active', 'inactive', 'suspended'),
            allowNull: false,
            defaultValue: 'active',
            field: 'status'
        },
        isVerified: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
            field: 'is_verified'
        },
        verifiedAt: {
            type: DataTypes.DATE,
            allowNull: true,
            field: 'verified_at'
        },
        password: {
            type: DataTypes.STRING,
            allowNull: true,
            field: 'password'
        },
        isDeleted: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
            field: 'is_deleted'
        }
    }, {
        tableName: 'doctors',
        timestamps: true,
        underscored: true
    });

    return Doctor;
};
