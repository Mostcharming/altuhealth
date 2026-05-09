'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('payment_advices', {
            id: {
                type: Sequelize.UUID,
                allowNull: false,
                primaryKey: true,
                defaultValue: Sequelize.UUIDV4,
                field: 'id'
            },
            payment_advice_number: {
                type: Sequelize.STRING,
                allowNull: false,
                unique: true,
                field: 'payment_advice_number'
            },
            provider_id: {
                type: Sequelize.UUID,
                allowNull: false,
                field: 'provider_id'
            },
            payment_batch_id: {
                type: Sequelize.UUID,
                allowNull: true,
                field: 'payment_batch_id'
            },
            total_amount: {
                type: Sequelize.DECIMAL(15, 2),
                allowNull: false,
                defaultValue: 0,
                field: 'total_amount'
            },
            number_of_claims: {
                type: Sequelize.INTEGER,
                allowNull: false,
                defaultValue: 0,
                field: 'number_of_claims'
            },
            payment_date: {
                type: Sequelize.DATE,
                allowNull: false,
                field: 'payment_date'
            },
            due_date: {
                type: Sequelize.DATE,
                allowNull: true,
                field: 'due_date'
            },
            payment_method: {
                type: Sequelize.ENUM('bank_transfer', 'check', 'cash', 'mobile_money'),
                allowNull: false,
                defaultValue: 'bank_transfer',
                field: 'payment_method'
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
            account_name: {
                type: Sequelize.STRING,
                allowNull: true,
                field: 'account_name'
            },
            account_type: {
                type: Sequelize.STRING,
                allowNull: true,
                field: 'account_type'
            },
            sort_code: {
                type: Sequelize.STRING,
                allowNull: true,
                field: 'sort_code'
            },
            routing_number: {
                type: Sequelize.STRING,
                allowNull: true,
                field: 'routing_number'
            },
            description: {
                type: Sequelize.TEXT,
                allowNull: true,
                field: 'description'
            },
            status: {
                type: Sequelize.ENUM('draft', 'approved', 'sent', 'acknowledged', 'cancelled'),
                allowNull: false,
                defaultValue: 'draft',
                field: 'status'
            },
            attachment_url: {
                type: Sequelize.STRING,
                allowNull: true,
                field: 'attachment_url'
            },
            approved_by: {
                type: Sequelize.UUID,
                allowNull: true,
                field: 'approved_by'
            },
            approved_at: {
                type: Sequelize.DATE,
                allowNull: true,
                field: 'approved_at'
            },
            sent_at: {
                type: Sequelize.DATE,
                allowNull: true,
                field: 'sent_at'
            },
            acknowledged_at: {
                type: Sequelize.DATE,
                allowNull: true,
                field: 'acknowledged_at'
            },
            notes: {
                type: Sequelize.TEXT,
                allowNull: true,
                field: 'notes'
            },
            created_by: {
                type: Sequelize.UUID,
                allowNull: true,
                field: 'created_by'
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

        // Add indexes for better query performance
        await queryInterface.addIndex('payment_advices', ['provider_id']);
        await queryInterface.addIndex('payment_advices', ['payment_batch_id']);
        await queryInterface.addIndex('payment_advices', ['status']);
        await queryInterface.addIndex('payment_advices', ['payment_advice_number']);
        await queryInterface.addIndex('payment_advices', ['payment_date']);
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('payment_advices');
    }
};
