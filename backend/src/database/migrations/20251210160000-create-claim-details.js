'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('claim_details', {
            id: {
                type: Sequelize.UUID,
                allowNull: false,
                primaryKey: true,
                defaultValue: Sequelize.UUIDV4,
                field: 'id'
            },
            claim_id: {
                type: Sequelize.UUID,
                allowNull: false,
                references: {
                    model: 'claims',
                    key: 'id'
                },
                onDelete: 'CASCADE',
                onUpdate: 'CASCADE',
                field: 'claim_id'
            },
            enrollee_id: {
                type: Sequelize.UUID,
                allowNull: true,
                references: {
                    model: 'enrollees',
                    key: 'id'
                },
                onDelete: 'CASCADE',
                onUpdate: 'CASCADE',
                field: 'enrollee_id'
            },
            retail_enrollee_id: {
                type: Sequelize.UUID,
                allowNull: true,
                references: {
                    model: 'retail_enrollees',
                    key: 'id'
                },
                onDelete: 'CASCADE',
                onUpdate: 'CASCADE',
                field: 'retail_enrollee_id'
            },
            company_id: {
                type: Sequelize.UUID,
                allowNull: true,
                references: {
                    model: 'companies',
                    key: 'id'
                },
                onDelete: 'CASCADE',
                onUpdate: 'CASCADE',
                field: 'company_id'
            },
            provider_id: {
                type: Sequelize.UUID,
                allowNull: false,
                references: {
                    model: 'providers',
                    key: 'id'
                },
                onDelete: 'CASCADE',
                onUpdate: 'CASCADE',
                field: 'provider_id'
            },
            diagnosis_id: {
                type: Sequelize.UUID,
                allowNull: true,
                references: {
                    model: 'diagnoses',
                    key: 'id'
                },
                onDelete: 'SET NULL',
                onUpdate: 'CASCADE',
                field: 'diagnosis_id'
            },
            service_date: {
                type: Sequelize.DATE,
                allowNull: false,
                field: 'service_date'
            },
            discharge_date: {
                type: Sequelize.DATE,
                allowNull: true,
                field: 'discharge_date'
            },
            service_type: {
                type: Sequelize.ENUM('outpatient', 'inpatient', 'emergency', 'procedure', 'consultation', 'diagnostic', 'laboratory', 'pharmacy', 'dental', 'optical'),
                allowNull: false,
                field: 'service_type'
            },
            description: {
                type: Sequelize.TEXT,
                allowNull: true,
                field: 'description'
            },
            amount_submitted: {
                type: Sequelize.DECIMAL(15, 2),
                allowNull: false,
                defaultValue: 0,
                field: 'amount_submitted'
            },
            amount_approved: {
                type: Sequelize.DECIMAL(15, 2),
                allowNull: false,
                defaultValue: 0,
                field: 'amount_approved'
            },
            amount_rejected: {
                type: Sequelize.DECIMAL(15, 2),
                allowNull: false,
                defaultValue: 0,
                field: 'amount_rejected'
            },
            quantity: {
                type: Sequelize.INTEGER,
                allowNull: true,
                defaultValue: 1,
                field: 'quantity'
            },
            unit_price: {
                type: Sequelize.DECIMAL(15, 2),
                allowNull: true,
                field: 'unit_price'
            },
            procedure_code: {
                type: Sequelize.STRING,
                allowNull: true,
                field: 'procedure_code'
            },
            procedure_name: {
                type: Sequelize.STRING,
                allowNull: true,
                field: 'procedure_name'
            },
            medication_code: {
                type: Sequelize.STRING,
                allowNull: true,
                field: 'medication_code'
            },
            medication_name: {
                type: Sequelize.STRING,
                allowNull: true,
                field: 'medication_name'
            },
            authorization_code: {
                type: Sequelize.STRING,
                allowNull: true,
                field: 'authorization_code'
            },
            referral_code: {
                type: Sequelize.STRING,
                allowNull: true,
                field: 'referral_code'
            },
            status: {
                type: Sequelize.ENUM('draft', 'submitted', 'approved', 'partially_approved', 'rejected', 'queried'),
                allowNull: false,
                defaultValue: 'draft',
                field: 'status'
            },
            rejection_reason: {
                type: Sequelize.TEXT,
                allowNull: true,
                field: 'rejection_reason'
            },
            vetter_notes: {
                type: Sequelize.TEXT,
                allowNull: true,
                field: 'vetter_notes'
            },
            attachment_url: {
                type: Sequelize.STRING,
                allowNull: true,
                field: 'attachment_url'
            },
            inpatient_days: {
                type: Sequelize.INTEGER,
                allowNull: true,
                field: 'inpatient_days'
            },
            created_at: {
                type: Sequelize.DATE,
                allowNull: false,
                defaultValue: Sequelize.NOW,
                field: 'created_at'
            },
            updated_at: {
                type: Sequelize.DATE,
                allowNull: false,
                defaultValue: Sequelize.NOW,
                field: 'updated_at'
            }
        });

        // Add indexes for faster queries
        await queryInterface.addIndex('claim_details', ['claim_id']);
        await queryInterface.addIndex('claim_details', ['enrollee_id']);
        await queryInterface.addIndex('claim_details', ['retail_enrollee_id']);
        await queryInterface.addIndex('claim_details', ['provider_id']);
        await queryInterface.addIndex('claim_details', ['company_id']);
        await queryInterface.addIndex('claim_details', ['diagnosis_id']);
        await queryInterface.addIndex('claim_details', ['service_date']);
        await queryInterface.addIndex('claim_details', ['status']);
        await queryInterface.addIndex('claim_details', ['authorization_code']);
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('claim_details');
    }
};
