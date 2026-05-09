'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.createTable('tickets', {
            id: {
                type: Sequelize.UUID,
                allowNull: false,
                primaryKey: true,
                defaultValue: Sequelize.literal('gen_random_uuid()')
            },
            ticket_number: {
                type: Sequelize.INTEGER,
                allowNull: false,
                unique: true,
                autoIncrement: true
            },
            user_id: {
                type: Sequelize.UUID,
                allowNull: false,
                comment: 'ID of the user who requested the ticket'
            },
            user_type: {
                type: Sequelize.ENUM('Enrollee', 'RetailEnrollee', 'Provider', 'Doctor'),
                allowNull: false,
                comment: 'Type of user (Enrollee, RetailEnrollee, Provider, Doctor)'
            },
            subject: {
                type: Sequelize.STRING,
                allowNull: false,
                comment: 'Subject of the ticket'
            },
            description: {
                type: Sequelize.TEXT,
                allowNull: true,
                comment: 'Detailed description of the ticket'
            },
            category: {
                type: Sequelize.ENUM(
                    'billing',
                    'technical',
                    'claim',
                    'provider',
                    'enrollment',
                    'prescription',
                    'appointment',
                    'general',
                    'other'
                ),
                allowNull: false,
                defaultValue: 'general',
                comment: 'Category of the ticket'
            },
            status: {
                type: Sequelize.ENUM('pending', 'in_progress', 'on_hold', 'solved', 'closed'),
                allowNull: false,
                defaultValue: 'pending',
                comment: 'Status of the ticket'
            },
            priority: {
                type: Sequelize.ENUM('low', 'medium', 'high', 'urgent'),
                allowNull: false,
                defaultValue: 'medium',
                comment: 'Priority level of the ticket'
            },
            assigned_to_id: {
                type: Sequelize.UUID,
                allowNull: true,
                comment: 'Admin ID if assigned to a specific admin'
            },
            created_at: {
                type: Sequelize.DATE,
                allowNull: false,
                defaultValue: Sequelize.literal('NOW()')
            },
            updated_at: {
                type: Sequelize.DATE,
                allowNull: false,
                defaultValue: Sequelize.literal('NOW()')
            },
            closed_at: {
                type: Sequelize.DATE,
                allowNull: true,
                comment: 'Timestamp when the ticket was closed'
            }
        });

        // Create index for user_id for faster queries
        await queryInterface.addIndex('tickets', ['user_id']);
        // Create index for status for filtering
        await queryInterface.addIndex('tickets', ['status']);
        // Create index for assigned_to_id for admin filtering
        await queryInterface.addIndex('tickets', ['assigned_to_id']);
        // Create index for created_at for sorting
        await queryInterface.addIndex('tickets', ['created_at']);
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.dropTable('tickets');
    }
};
