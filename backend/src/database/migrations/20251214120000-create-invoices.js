'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('invoices', {
            id: {
                type: Sequelize.UUID,
                allowNull: false,
                primaryKey: true,
                defaultValue: Sequelize.UUIDV4,
                field: 'id'
            },
            invoice_number: {
                type: Sequelize.STRING,
                allowNull: false,
                unique: true,
                field: 'invoice_number'
            },
            provider_id: {
                type: Sequelize.UUID,
                allowNull: true,
                references: {
                    model: 'providers',
                    key: 'id'
                },
                onDelete: 'SET NULL',
                onUpdate: 'CASCADE',
                field: 'provider_id'
            },
            enrollee_id: {
                type: Sequelize.UUID,
                allowNull: true,
                references: {
                    model: 'enrollees',
                    key: 'id'
                },
                onDelete: 'SET NULL',
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
                onDelete: 'SET NULL',
                onUpdate: 'CASCADE',
                field: 'retail_enrollee_id'
            },
            customer_name: {
                type: Sequelize.STRING,
                allowNull: false,
                field: 'customer_name'
            },
            customer_address: {
                type: Sequelize.TEXT,
                allowNull: true,
                field: 'customer_address'
            },
            customer_phone: {
                type: Sequelize.STRING,
                allowNull: true,
                field: 'customer_phone'
            },
            customer_email: {
                type: Sequelize.STRING,
                allowNull: true,
                field: 'customer_email'
            },
            invoice_date: {
                type: Sequelize.DATE,
                allowNull: false,
                defaultValue: Sequelize.NOW,
                field: 'invoice_date'
            },
            due_date: {
                type: Sequelize.DATE,
                allowNull: true,
                field: 'due_date'
            },
            subtotal: {
                type: Sequelize.DECIMAL(15, 2),
                allowNull: false,
                defaultValue: 0,
                field: 'subtotal'
            },
            discount_amount: {
                type: Sequelize.DECIMAL(15, 2),
                allowNull: false,
                defaultValue: 0,
                field: 'discount_amount'
            },
            discount_percentage: {
                type: Sequelize.DECIMAL(5, 2),
                allowNull: true,
                field: 'discount_percentage'
            },
            tax_amount: {
                type: Sequelize.DECIMAL(15, 2),
                allowNull: false,
                defaultValue: 0,
                field: 'tax_amount'
            },
            tax_percentage: {
                type: Sequelize.DECIMAL(5, 2),
                allowNull: true,
                field: 'tax_percentage'
            },
            total_amount: {
                type: Sequelize.DECIMAL(15, 2),
                allowNull: false,
                defaultValue: 0,
                field: 'total_amount'
            },
            paid_amount: {
                type: Sequelize.DECIMAL(15, 2),
                allowNull: false,
                defaultValue: 0,
                field: 'paid_amount'
            },
            balance_amount: {
                type: Sequelize.DECIMAL(15, 2),
                allowNull: false,
                defaultValue: 0,
                field: 'balance_amount'
            },
            status: {
                type: Sequelize.ENUM('draft', 'issued', 'partially_paid', 'paid', 'overdue', 'cancelled'),
                allowNull: false,
                defaultValue: 'draft',
                field: 'status'
            },
            payment_status: {
                type: Sequelize.ENUM('unpaid', 'partially_paid', 'paid'),
                allowNull: false,
                defaultValue: 'unpaid',
                field: 'payment_status'
            },
            currency: {
                type: Sequelize.STRING,
                allowNull: false,
                defaultValue: 'NGN',
                field: 'currency'
            },
            notes: {
                type: Sequelize.TEXT,
                allowNull: true,
                field: 'notes'
            },
            description: {
                type: Sequelize.TEXT,
                allowNull: true,
                field: 'description'
            },
            issued_by: {
                type: Sequelize.UUID,
                allowNull: true,
                field: 'issued_by'
            },
            issued_by_type: {
                type: Sequelize.ENUM('Admin', 'System'),
                allowNull: false,
                defaultValue: 'System',
                field: 'issued_by_type'
            },
            cancelled_at: {
                type: Sequelize.DATE,
                allowNull: true,
                field: 'cancelled_at'
            },
            cancelled_reason: {
                type: Sequelize.TEXT,
                allowNull: true,
                field: 'cancelled_reason'
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
        await queryInterface.addIndex('invoices', ['invoice_number'], { unique: true });
        await queryInterface.addIndex('invoices', ['provider_id']);
        await queryInterface.addIndex('invoices', ['enrollee_id']);
        await queryInterface.addIndex('invoices', ['retail_enrollee_id']);
        await queryInterface.addIndex('invoices', ['status']);
        await queryInterface.addIndex('invoices', ['payment_status']);
        await queryInterface.addIndex('invoices', ['invoice_date']);
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('invoices');
    }
};
