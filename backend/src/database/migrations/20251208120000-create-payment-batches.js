'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('payment_batches', {
            id: {
                type: Sequelize.UUID,
                allowNull: false,
                primaryKey: true,
                defaultValue: Sequelize.UUIDV4,
                field: 'id'
            },
            title: {
                type: Sequelize.STRING,
                allowNull: false,
                field: 'title'
            },
            description: {
                type: Sequelize.TEXT,
                allowNull: true,
                field: 'description'
            },
            number_of_batches: {
                type: Sequelize.INTEGER,
                allowNull: false,
                defaultValue: 0,
                field: 'number_of_batches'
            },
            number_of_providers: {
                type: Sequelize.INTEGER,
                allowNull: false,
                defaultValue: 0,
                field: 'number_of_providers'
            },
            conflict_count: {
                type: Sequelize.INTEGER,
                allowNull: false,
                defaultValue: 0,
                field: 'conflict_count'
            },
            total_claims_amount: {
                type: Sequelize.DECIMAL(15, 2),
                allowNull: false,
                defaultValue: 0,
                field: 'total_claims_amount'
            },
            reconciliation_amount: {
                type: Sequelize.DECIMAL(15, 2),
                allowNull: false,
                defaultValue: 0,
                field: 'reconciliation_amount'
            },
            status: {
                type: Sequelize.ENUM('pending', 'processing', 'completed', 'failed', 'partial'),
                allowNull: false,
                defaultValue: 'pending',
                field: 'status'
            },
            is_paid: {
                type: Sequelize.BOOLEAN,
                allowNull: false,
                defaultValue: false,
                field: 'is_paid'
            },
            number_paid: {
                type: Sequelize.INTEGER,
                allowNull: false,
                defaultValue: 0,
                field: 'number_paid'
            },
            number_unpaid: {
                type: Sequelize.INTEGER,
                allowNull: false,
                defaultValue: 0,
                field: 'number_unpaid'
            },
            paid_amount: {
                type: Sequelize.DECIMAL(15, 2),
                allowNull: false,
                defaultValue: 0,
                field: 'paid_amount'
            },
            unpaid_amount: {
                type: Sequelize.DECIMAL(15, 2),
                allowNull: false,
                defaultValue: 0,
                field: 'unpaid_amount'
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

        // Add index for status and is_paid for faster queries
        await queryInterface.addIndex('payment_batches', ['status']);
        await queryInterface.addIndex('payment_batches', ['is_paid']);
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('payment_batches');
    }
};
