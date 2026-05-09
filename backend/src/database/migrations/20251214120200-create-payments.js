'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('payments', {
            id: {
                type: Sequelize.UUID,
                allowNull: false,
                primaryKey: true,
                defaultValue: Sequelize.UUIDV4,
                field: 'id'
            },
            invoice_id: {
                type: Sequelize.UUID,
                allowNull: false,
                references: {
                    model: 'invoices',
                    key: 'id'
                },
                onDelete: 'CASCADE',
                onUpdate: 'CASCADE',
                field: 'invoice_id'
            },
            payment_number: {
                type: Sequelize.STRING,
                allowNull: false,
                unique: true,
                field: 'payment_number'
            },
            payment_amount: {
                type: Sequelize.DECIMAL(15, 2),
                allowNull: false,
                field: 'payment_amount'
            },
            payment_date: {
                type: Sequelize.DATE,
                allowNull: false,
                defaultValue: Sequelize.NOW,
                field: 'payment_date'
            },
            payment_method: {
                type: Sequelize.ENUM('bank_transfer', 'cash', 'cheque', 'card', 'mobile_money', 'wallet', 'other'),
                allowNull: false,
                field: 'payment_method'
            },
            currency: {
                type: Sequelize.STRING,
                allowNull: false,
                defaultValue: 'NGN',
                field: 'currency'
            },
            transaction_reference: {
                type: Sequelize.STRING,
                allowNull: true,
                field: 'transaction_reference'
            },
            bank_name: {
                type: Sequelize.STRING,
                allowNull: true,
                field: 'bank_name'
            },
            account_name: {
                type: Sequelize.STRING,
                allowNull: true,
                field: 'account_name'
            },
            cheque_number: {
                type: Sequelize.STRING,
                allowNull: true,
                field: 'cheque_number'
            },
            cheque_date: {
                type: Sequelize.DATE,
                allowNull: true,
                field: 'cheque_date'
            },
            payment_gateway_provider: {
                type: Sequelize.STRING,
                allowNull: true,
                field: 'payment_gateway_provider'
            },
            payment_gateway_transaction_id: {
                type: Sequelize.STRING,
                allowNull: true,
                field: 'payment_gateway_transaction_id'
            },
            description: {
                type: Sequelize.TEXT,
                allowNull: true,
                field: 'description'
            },
            receipt_url: {
                type: Sequelize.STRING,
                allowNull: true,
                field: 'receipt_url'
            },
            status: {
                type: Sequelize.ENUM('pending', 'completed', 'failed', 'cancelled', 'refunded'),
                allowNull: false,
                defaultValue: 'completed',
                field: 'status'
            },
            processed_by: {
                type: Sequelize.UUID,
                allowNull: true,
                field: 'processed_by'
            },
            processed_by_type: {
                type: Sequelize.ENUM('Admin', 'System', 'Automated'),
                allowNull: false,
                defaultValue: 'System',
                field: 'processed_by_type'
            },
            verification_status: {
                type: Sequelize.ENUM('unverified', 'verified', 'failed_verification'),
                allowNull: false,
                defaultValue: 'unverified',
                field: 'verification_status'
            },
            verified_at: {
                type: Sequelize.DATE,
                allowNull: true,
                field: 'verified_at'
            },
            verified_by: {
                type: Sequelize.UUID,
                allowNull: true,
                field: 'verified_by'
            },
            refund_amount: {
                type: Sequelize.DECIMAL(15, 2),
                allowNull: true,
                defaultValue: 0,
                field: 'refund_amount'
            },
            refund_date: {
                type: Sequelize.DATE,
                allowNull: true,
                field: 'refund_date'
            },
            refund_reason: {
                type: Sequelize.TEXT,
                allowNull: true,
                field: 'refund_reason'
            },
            failure_reason: {
                type: Sequelize.TEXT,
                allowNull: true,
                field: 'failure_reason'
            },
            notes: {
                type: Sequelize.TEXT,
                allowNull: true,
                field: 'notes'
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

        // Add indexes for common queries
        await queryInterface.addIndex('payments', ['invoice_id']);
        await queryInterface.addIndex('payments', ['payment_number'], { unique: true });
        await queryInterface.addIndex('payments', ['payment_date']);
        await queryInterface.addIndex('payments', ['status']);
        await queryInterface.addIndex('payments', ['verification_status']);
        await queryInterface.addIndex('payments', ['payment_method']);
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('payments');
    }
};
