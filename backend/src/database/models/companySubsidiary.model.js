'use strict';

module.exports = (sequelize, DataTypes) => {
    const CompanySubsidiary = sequelize.define('CompanySubsidiary', {
        id: {
            type: DataTypes.UUID,
            allowNull: false,
            primaryKey: true,
            defaultValue: DataTypes.UUIDV4,
            field: 'id'
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
        name: {
            type: DataTypes.STRING,
            allowNull: false,
            field: 'name'
        },
        registrationNumber: {
            type: DataTypes.STRING,
            allowNull: true,
            unique: true,
            field: 'registration_number'
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
        secondaryPhoneNumber: {
            type: DataTypes.STRING,
            allowNull: true,
            field: 'secondary_phone_number'
        },
        address: {
            type: DataTypes.STRING,
            allowNull: false,
            field: 'address'
        },
        city: {
            type: DataTypes.STRING,
            allowNull: false,
            field: 'city'
        },
        state: {
            type: DataTypes.STRING,
            allowNull: false,
            field: 'state'
        },
        country: {
            type: DataTypes.STRING,
            allowNull: false,
            field: 'country'
        },
        zipCode: {
            type: DataTypes.STRING,
            allowNull: true,
            field: 'zip_code'
        },
        website: {
            type: DataTypes.STRING,
            allowNull: true,
            field: 'website'
        },
        industryType: {
            type: DataTypes.STRING,
            allowNull: true,
            field: 'industry_type',
            comment: 'e.g., manufacturing, IT, healthcare, retail'
        },
        numberOfEmployees: {
            type: DataTypes.INTEGER,
            allowNull: true,
            field: 'number_of_employees'
        },
        contactPersonName: {
            type: DataTypes.STRING,
            allowNull: false,
            field: 'contact_person_name'
        },
        contactPersonTitle: {
            type: DataTypes.STRING,
            allowNull: true,
            field: 'contact_person_title'
        },
        contactPersonEmail: {
            type: DataTypes.STRING,
            allowNull: true,
            validate: {
                isEmail: true
            },
            field: 'contact_person_email'
        },
        contactPersonPhoneNumber: {
            type: DataTypes.STRING,
            allowNull: true,
            field: 'contact_person_phone_number'
        },
        taxIdentificationNumber: {
            type: DataTypes.STRING,
            allowNull: true,
            field: 'tax_identification_number'
        },
        bankName: {
            type: DataTypes.STRING,
            allowNull: true,
            field: 'bank_name'
        },
        bankAccountNumber: {
            type: DataTypes.STRING,
            allowNull: true,
            field: 'bank_account_number'
        },
        bankCode: {
            type: DataTypes.STRING,
            allowNull: true,
            field: 'bank_code'
        },
        subsidiaryType: {
            type: DataTypes.ENUM('branch', 'division', 'regional_office', 'satellite_office'),
            allowNull: false,
            defaultValue: 'branch',
            field: 'subsidiary_type'
        },
        establishmentDate: {
            type: DataTypes.DATE,
            allowNull: true,
            field: 'establishment_date'
        },
        operatingLicense: {
            type: DataTypes.STRING,
            allowNull: true,
            field: 'operating_license'
        },
        licenseExpiryDate: {
            type: DataTypes.DATE,
            allowNull: true,
            field: 'license_expiry_date'
        },
        isActive: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: true,
            field: 'is_active'
        },
        parentSubsidiaryId: {
            type: DataTypes.UUID,
            allowNull: true,
            references: {
                model: 'company_subsidiaries',
                key: 'id'
            },
            field: 'parent_subsidiary_id',
            comment: 'For nested subsidiary structure'
        },
        metadata: {
            type: DataTypes.JSON,
            allowNull: true,
            field: 'metadata',
            comment: 'For storing additional custom information'
        }
    }, {
        tableName: 'company_subsidiaries',
        timestamps: true,
        underscored: true
    });

    return CompanySubsidiary;
};
