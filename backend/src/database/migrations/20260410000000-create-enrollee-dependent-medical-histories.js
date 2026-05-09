'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        // Create enrollee_dependent_medical_histories table
        await queryInterface.createTable('enrollee_dependent_medical_histories', {
            id: {
                type: Sequelize.UUID,
                allowNull: false,
                primaryKey: true,
                defaultValue: Sequelize.UUIDV4
            },
            enrollee_dependent_id: {
                type: Sequelize.UUID,
                allowNull: false,
                references: {
                    model: 'enrollee_dependents',
                    key: 'id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE'
            },
            provider_id: {
                type: Sequelize.UUID,
                allowNull: true,
                references: {
                    model: 'providers',
                    key: 'id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'SET NULL'
            },
            diagnosis_id: {
                type: Sequelize.UUID,
                allowNull: true,
                references: {
                    model: 'diagnoses',
                    key: 'id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'SET NULL'
            },
            evs_code: {
                type: Sequelize.STRING,
                allowNull: true
            },
            amount: {
                type: Sequelize.DECIMAL(10, 2),
                allowNull: true
            },
            service_date: {
                type: Sequelize.DATE,
                allowNull: true
            },
            notes: {
                type: Sequelize.TEXT,
                allowNull: true
            },
            attachment_url: {
                type: Sequelize.STRING,
                allowNull: true
            },
            status: {
                type: Sequelize.ENUM('pending', 'reviewed', 'approved', 'rejected'),
                allowNull: false,
                defaultValue: 'pending'
            },
            currency: {
                type: Sequelize.STRING,
                allowNull: false,
                defaultValue: 'NGN'
            },
            created_at: {
                type: Sequelize.DATE,
                allowNull: false,
                defaultValue: Sequelize.NOW
            },
            updated_at: {
                type: Sequelize.DATE,
                allowNull: false,
                defaultValue: Sequelize.NOW
            }
        });

        // Add indexes
        await queryInterface.addIndex('enrollee_dependent_medical_histories', ['enrollee_dependent_id']);
        await queryInterface.addIndex('enrollee_dependent_medical_histories', ['provider_id']);
        await queryInterface.addIndex('enrollee_dependent_medical_histories', ['diagnosis_id']);
        await queryInterface.addIndex('enrollee_dependent_medical_histories', ['status']);
    },

    async down(queryInterface, Sequelize) {
        // Drop table
        await queryInterface.dropTable('enrollee_dependent_medical_histories');
    }
};
