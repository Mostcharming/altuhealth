'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        // Add columns to payment_batches table
        await queryInterface.addColumn('payment_batches', 'payment_date', {
            type: Sequelize.DATE,
            allowNull: true,
            field: 'payment_date'
        });

        await queryInterface.addColumn('payment_batches', 'due_date', {
            type: Sequelize.DATE,
            allowNull: true,
            field: 'due_date'
        });

        await queryInterface.addColumn('payment_batches', 'notes', {
            type: Sequelize.TEXT,
            allowNull: true,
            field: 'notes'
        });

        await queryInterface.addColumn('payment_batches', 'created_by', {
            type: Sequelize.UUID,
            allowNull: true,
            field: 'created_by'
        });

        await queryInterface.addColumn('payment_batches', 'updated_by', {
            type: Sequelize.UUID,
            allowNull: true,
            field: 'updated_by'
        });

        await queryInterface.addColumn('payment_batches', 'approved_by', {
            type: Sequelize.UUID,
            allowNull: true,
            field: 'approved_by'
        });

        await queryInterface.addColumn('payment_batches', 'approved_date', {
            type: Sequelize.DATE,
            allowNull: true,
            field: 'approved_date'
        });

        await queryInterface.addColumn('payment_batches', 'processing_notes', {
            type: Sequelize.TEXT,
            allowNull: true,
            field: 'processing_notes'
        });

        // Add columns to payment_batch_details table
        await queryInterface.addColumn('payment_batch_details', 'claims_amount', {
            type: Sequelize.DECIMAL(15, 2),
            allowNull: false,
            defaultValue: 0,
            field: 'claims_amount'
        });

        await queryInterface.addColumn('payment_batch_details', 'payment_status', {
            type: Sequelize.ENUM('pending', 'paid', 'partial', 'disputed'),
            allowNull: false,
            defaultValue: 'pending',
            field: 'payment_status'
        });

        await queryInterface.addColumn('payment_batch_details', 'notes', {
            type: Sequelize.TEXT,
            allowNull: true,
            field: 'notes'
        });

        // Add indexes for payment_batches
        await queryInterface.addIndex('payment_batches', ['payment_date']);
        await queryInterface.addIndex('payment_batches', ['due_date']);
        await queryInterface.addIndex('payment_batches', ['created_by']);
        await queryInterface.addIndex('payment_batches', ['approved_by']);

        // Add indexes for payment_batch_details
        await queryInterface.addIndex('payment_batch_details', ['payment_status']);
        await queryInterface.addIndex('payment_batch_details', ['period']);
    },

    down: async (queryInterface, Sequelize) => {
        // Remove columns from payment_batches table
        await queryInterface.removeColumn('payment_batches', 'payment_date');
        await queryInterface.removeColumn('payment_batches', 'due_date');
        await queryInterface.removeColumn('payment_batches', 'notes');
        await queryInterface.removeColumn('payment_batches', 'created_by');
        await queryInterface.removeColumn('payment_batches', 'updated_by');
        await queryInterface.removeColumn('payment_batches', 'approved_by');
        await queryInterface.removeColumn('payment_batches', 'approved_date');
        await queryInterface.removeColumn('payment_batches', 'processing_notes');

        // Remove columns from payment_batch_details table
        await queryInterface.removeColumn('payment_batch_details', 'claims_amount');
        await queryInterface.removeColumn('payment_batch_details', 'payment_status');
        await queryInterface.removeColumn('payment_batch_details', 'notes');
    }
};
