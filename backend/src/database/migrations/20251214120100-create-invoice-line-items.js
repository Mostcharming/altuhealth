'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('invoice_line_items', {
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
            item_number: {
                type: Sequelize.INTEGER,
                allowNull: false,
                field: 'item_number'
            },
            service_name: {
                type: Sequelize.STRING,
                allowNull: false,
                field: 'service_name'
            },
            description: {
                type: Sequelize.TEXT,
                allowNull: true,
                field: 'description'
            },
            quantity: {
                type: Sequelize.DECIMAL(10, 2),
                allowNull: false,
                defaultValue: 1,
                field: 'quantity'
            },
            unit_of_measure: {
                type: Sequelize.STRING,
                allowNull: true,
                defaultValue: 'unit',
                field: 'unit_of_measure'
            },
            unit_cost: {
                type: Sequelize.DECIMAL(15, 2),
                allowNull: false,
                field: 'unit_cost'
            },
            subtotal: {
                type: Sequelize.DECIMAL(15, 2),
                allowNull: false,
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
            line_total: {
                type: Sequelize.DECIMAL(15, 2),
                allowNull: false,
                field: 'line_total'
            },
            service_id: {
                type: Sequelize.UUID,
                allowNull: true,
                references: {
                    model: 'services',
                    key: 'id'
                },
                onDelete: 'SET NULL',
                onUpdate: 'CASCADE',
                field: 'service_id'
            },
            product_id: {
                type: Sequelize.UUID,
                allowNull: true,
                field: 'product_id'
            },
            product_code: {
                type: Sequelize.STRING,
                allowNull: true,
                field: 'product_code'
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
        await queryInterface.addIndex('invoice_line_items', ['invoice_id']);
        await queryInterface.addIndex('invoice_line_items', ['service_id']);
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('invoice_line_items');
    }
};
