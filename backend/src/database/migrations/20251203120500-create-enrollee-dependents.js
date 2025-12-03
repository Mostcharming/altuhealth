'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        // Create enrollee_dependents table
        await queryInterface.createTable('enrollee_dependents', {
            id: {
                type: Sequelize.UUID,
                allowNull: false,
                primaryKey: true,
                defaultValue: Sequelize.UUIDV4
            },
            enrollee_id: {
                type: Sequelize.UUID,
                allowNull: false,
                references: {
                    model: 'enrollees',
                    key: 'id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE'
            },
            policy_number: {
                type: Sequelize.STRING,
                allowNull: false,
                unique: true
            },
            first_name: {
                type: Sequelize.STRING,
                allowNull: false
            },
            middle_name: {
                type: Sequelize.STRING,
                allowNull: true
            },
            last_name: {
                type: Sequelize.STRING,
                allowNull: false
            },
            date_of_birth: {
                type: Sequelize.DATE,
                allowNull: false
            },
            gender: {
                type: Sequelize.ENUM('male', 'female', 'other'),
                allowNull: false
            },
            relationship_to_enrollee: {
                type: Sequelize.ENUM('spouse', 'child', 'parent', 'sibling', 'other'),
                allowNull: false
            },
            phone_number: {
                type: Sequelize.STRING,
                allowNull: true
            },
            email: {
                type: Sequelize.STRING,
                allowNull: true
            },
            occupation: {
                type: Sequelize.STRING,
                allowNull: true
            },
            marital_status: {
                type: Sequelize.ENUM('single', 'married', 'divorced', 'widowed', 'separated'),
                allowNull: true
            },
            picture_url: {
                type: Sequelize.STRING,
                allowNull: true
            },
            id_card_url: {
                type: Sequelize.STRING,
                allowNull: true
            },
            preexisting_medical_records: {
                type: Sequelize.TEXT,
                allowNull: true
            },
            is_verified: {
                type: Sequelize.BOOLEAN,
                allowNull: false,
                defaultValue: false
            },
            verification_code: {
                type: Sequelize.STRING,
                allowNull: true,
                unique: true
            },
            verification_code_expires_at: {
                type: Sequelize.DATE,
                allowNull: true
            },
            verified_at: {
                type: Sequelize.DATE,
                allowNull: true
            },
            verification_attempts: {
                type: Sequelize.INTEGER,
                allowNull: false,
                defaultValue: 0
            },
            enrollment_date: {
                type: Sequelize.DATE,
                allowNull: false,
                defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
            },
            expiration_date: {
                type: Sequelize.DATE,
                allowNull: true
            },
            is_active: {
                type: Sequelize.BOOLEAN,
                allowNull: false,
                defaultValue: true
            },
            notes: {
                type: Sequelize.TEXT,
                allowNull: true
            },
            created_at: {
                type: Sequelize.DATE,
                allowNull: false,
                defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
            },
            updated_at: {
                type: Sequelize.DATE,
                allowNull: false,
                defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
            }
        });

        // Create index on enrollee_id for faster queries
        await queryInterface.addIndex('enrollee_dependents', ['enrollee_id']);

        // Create index on email for faster lookups
        await queryInterface.addIndex('enrollee_dependents', ['email']);

        // Create composite index for enrollee and is_active
        await queryInterface.addIndex('enrollee_dependents', ['enrollee_id', 'is_active']);
    },

    async down(queryInterface, Sequelize) {
        // Drop table
        await queryInterface.dropTable('enrollee_dependents');
    }
};
