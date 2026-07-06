'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('company_subsidiaries', {
            id: {
                type: Sequelize.UUID,
                allowNull: false,
                primaryKey: true,
                defaultValue: Sequelize.UUIDV4,
                field: 'id'
            },
            company_id: {
                type: Sequelize.UUID,
                allowNull: false,
                references: {
                    model: 'companies',
                    key: 'id'
                },
                field: 'company_id'
            },
            name: {
                type: Sequelize.STRING,
                allowNull: false,
                field: 'name'
            },
            registration_number: {
                type: Sequelize.STRING,
                allowNull: true,
                unique: true,
                field: 'registration_number'
            },
            email: {
                type: Sequelize.STRING,
                allowNull: false,
                unique: true,
                field: 'email'
            },
            phone_number: {
                type: Sequelize.STRING,
                allowNull: false,
                field: 'phone_number'
            },
            secondary_phone_number: {
                type: Sequelize.STRING,
                allowNull: true,
                field: 'secondary_phone_number'
            },
            address: {
                type: Sequelize.STRING,
                allowNull: false,
                field: 'address'
            },
            city: {
                type: Sequelize.STRING,
                allowNull: false,
                field: 'city'
            },
            state: {
                type: Sequelize.STRING,
                allowNull: false,
                field: 'state'
            },
            country: {
                type: Sequelize.STRING,
                allowNull: false,
                field: 'country'
            },
            zip_code: {
                type: Sequelize.STRING,
                allowNull: true,
                field: 'zip_code'
            },
            website: {
                type: Sequelize.STRING,
                allowNull: true,
                field: 'website'
            },
            industry_type: {
                type: Sequelize.STRING,
                allowNull: true,
                field: 'industry_type',
                comment: 'e.g., manufacturing, IT, healthcare, retail'
            },
            number_of_employees: {
                type: Sequelize.INTEGER,
                allowNull: true,
                field: 'number_of_employees'
            },
            contact_person_name: {
                type: Sequelize.STRING,
                allowNull: false,
                field: 'contact_person_name'
            },
            contact_person_title: {
                type: Sequelize.STRING,
                allowNull: true,
                field: 'contact_person_title'
            },
            contact_person_email: {
                type: Sequelize.STRING,
                allowNull: true,
                field: 'contact_person_email'
            },
            contact_person_phone_number: {
                type: Sequelize.STRING,
                allowNull: true,
                field: 'contact_person_phone_number'
            },
            tax_identification_number: {
                type: Sequelize.STRING,
                allowNull: true,
                field: 'tax_identification_number'
            },
            bank_name: {
                type: Sequelize.STRING,
                allowNull: true,
                field: 'bank_name'
            },
            bank_account_number: {
                type: Sequelize.STRING,
                allowNull: true,
                field: 'bank_account_number'
            },
            bank_code: {
                type: Sequelize.STRING,
                allowNull: true,
                field: 'bank_code'
            },
            subsidiary_type: {
                type: Sequelize.ENUM('branch', 'division', 'regional_office', 'satellite_office'),
                allowNull: false,
                defaultValue: 'branch',
                field: 'subsidiary_type'
            },
            establishment_date: {
                type: Sequelize.DATE,
                allowNull: true,
                field: 'establishment_date'
            },
            operating_license: {
                type: Sequelize.STRING,
                allowNull: true,
                field: 'operating_license'
            },
            license_expiry_date: {
                type: Sequelize.DATE,
                allowNull: true,
                field: 'license_expiry_date'
            },
            is_active: {
                type: Sequelize.BOOLEAN,
                allowNull: false,
                defaultValue: true,
                field: 'is_active'
            },
            parent_subsidiary_id: {
                type: Sequelize.UUID,
                allowNull: true,
                references: {
                    model: 'company_subsidiaries',
                    key: 'id'
                },
                field: 'parent_subsidiary_id'
            },
            metadata: {
                type: Sequelize.JSON,
                allowNull: true,
                field: 'metadata'
            },
            created_at: {
                type: Sequelize.DATE,
                allowNull: false,
                defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
                field: 'created_at'
            },
            updated_at: {
                type: Sequelize.DATE,
                allowNull: false,
                defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
                field: 'updated_at'
            }
        });

        // Add indexes for common queries
        await queryInterface.addIndex('company_subsidiaries', ['company_id']);
        await queryInterface.addIndex('company_subsidiaries', ['is_active']);
        await queryInterface.addIndex('company_subsidiaries', ['subsidiary_type']);
        await queryInterface.addIndex('company_subsidiaries', ['parent_subsidiary_id']);
        await queryInterface.addIndex('company_subsidiaries', ['email']);
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('company_subsidiaries');
    }
};
