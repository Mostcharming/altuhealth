'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('claims', {
            id: {
                type: Sequelize.UUID,
                allowNull: false,
                primaryKey: true,
                defaultValue: Sequelize.UUIDV4,
                field: 'id'
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
            number_of_encounters: {
                type: Sequelize.INTEGER,
                allowNull: false,
                defaultValue: 0,
                field: 'number_of_encounters'
            },
            amount_submitted: {
                type: Sequelize.DECIMAL(15, 2),
                allowNull: false,
                defaultValue: 0,
                field: 'amount_submitted'
            },
            amount_processed: {
                type: Sequelize.DECIMAL(15, 2),
                allowNull: false,
                defaultValue: 0,
                field: 'amount_processed'
            },
            difference: {
                type: Sequelize.DECIMAL(15, 2),
                allowNull: false,
                defaultValue: 0,
                field: 'difference'
            },
            year: {
                type: Sequelize.INTEGER,
                allowNull: false,
                field: 'year'
            },
            month: {
                type: Sequelize.INTEGER,
                allowNull: false,
                field: 'month'
            },
            date_submitted: {
                type: Sequelize.DATE,
                allowNull: false,
                defaultValue: Sequelize.NOW,
                field: 'date_submitted'
            },
            date_paid: {
                type: Sequelize.DATE,
                allowNull: true,
                field: 'date_paid'
            },
            bank_used_for_payment: {
                type: Sequelize.STRING,
                allowNull: true,
                field: 'bank_used_for_payment'
            },
            bank_account_number: {
                type: Sequelize.STRING,
                allowNull: true,
                field: 'bank_account_number'
            },
            account_name: {
                type: Sequelize.STRING,
                allowNull: true,
                field: 'account_name'
            },
            payment_batch_id: {
                type: Sequelize.UUID,
                allowNull: true,
                references: {
                    model: 'payment_batches',
                    key: 'id'
                },
                onDelete: 'SET NULL',
                onUpdate: 'CASCADE',
                field: 'payment_batch_id'
            },
            submitted_by_type: {
                type: Sequelize.ENUM('Admin', 'Enrollee', 'Provider', 'Staff'),
                allowNull: false,
                field: 'submitted_by_type'
            },
            submitted_by_id: {
                type: Sequelize.UUID,
                allowNull: false,
                field: 'submitted_by_id'
            },
            status: {
                type: Sequelize.ENUM(
                    'draft',
                    'submitted',
                    'pending_vetting',
                    'under_review',
                    'awaiting_payment',
                    'paid',
                    'rejected',
                    'partially_paid',
                    'queried'
                ),
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
            claim_reference: {
                type: Sequelize.STRING,
                allowNull: true,
                unique: true,
                field: 'claim_reference'
            },
            description: {
                type: Sequelize.TEXT,
                allowNull: true,
                field: 'description'
            },
            attachment_url: {
                type: Sequelize.STRING,
                allowNull: true,
                field: 'attachment_url'
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
        await queryInterface.addIndex('claims', ['provider_id']);
        await queryInterface.addIndex('claims', ['payment_batch_id']);
        await queryInterface.addIndex('claims', ['status']);
        await queryInterface.addIndex('claims', ['claim_reference']);
        await queryInterface.addIndex('claims', ['date_submitted']);
        await queryInterface.addIndex('claims', ['date_paid']);
        await queryInterface.addIndex('claims', ['year', 'month']);
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('claims');
    }
};
