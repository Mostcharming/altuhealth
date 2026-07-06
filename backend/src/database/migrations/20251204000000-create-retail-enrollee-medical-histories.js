'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        // Create retail_enrollee_medical_histories table
        await queryInterface.createTable('retail_enrollee_medical_histories', {
            id: {
                type: Sequelize.UUID,
                allowNull: false,
                primaryKey: true,
                defaultValue: Sequelize.UUIDV4
            },
            retail_enrollee_id: {
                type: Sequelize.UUID,
                allowNull: false,
                references: {
                    model: 'retail_enrollees',
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

        // Add indexes
        await queryInterface.addIndex('retail_enrollee_medical_histories', ['retail_enrollee_id']);
        await queryInterface.addIndex('retail_enrollee_medical_histories', ['provider_id']);
        await queryInterface.addIndex('retail_enrollee_medical_histories', ['diagnosis_id']);
        await queryInterface.addIndex('retail_enrollee_medical_histories', ['status']);
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('retail_enrollee_medical_histories');
    }
};
