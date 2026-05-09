'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.createTable('ticket_messages', {
            id: {
                type: Sequelize.UUID,
                allowNull: false,
                primaryKey: true,
                defaultValue: Sequelize.literal('gen_random_uuid()')
            },
            ticket_id: {
                type: Sequelize.UUID,
                allowNull: false,
                references: {
                    model: 'tickets',
                    key: 'id'
                },
                onDelete: 'CASCADE',
                onUpdate: 'CASCADE',
                comment: 'Reference to the parent ticket'
            },
            sender_id: {
                type: Sequelize.UUID,
                allowNull: false,
                comment: 'ID of the user sending the message'
            },
            sender_type: {
                type: Sequelize.ENUM('Enrollee', 'RetailEnrollee', 'Provider', 'Doctor', 'Admin', 'System'),
                allowNull: false,
                comment: 'Type of user sending the message'
            },
            message_type: {
                type: Sequelize.ENUM('text', 'attachment', 'system', 'status_update', 'note'),
                allowNull: false,
                defaultValue: 'text',
                comment: 'Type of message content'
            },
            content: {
                type: Sequelize.TEXT,
                allowNull: true,
                comment: 'Message content (text)'
            },
            attachment_url: {
                type: Sequelize.STRING,
                allowNull: true,
                comment: 'URL of attached image or file'
            },
            attachment_type: {
                type: Sequelize.ENUM('image', 'document', 'other'),
                allowNull: true,
                comment: 'Type of attachment'
            },
            attachment_name: {
                type: Sequelize.STRING,
                allowNull: true,
                comment: 'Original name of the attachment'
            },
            is_internal: {
                type: Sequelize.BOOLEAN,
                allowNull: false,
                defaultValue: false,
                comment: 'Whether this is an internal note (only visible to admins)'
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
            }
        });

        // Create indexes for faster queries
        await queryInterface.addIndex('ticket_messages', ['ticket_id']);
        await queryInterface.addIndex('ticket_messages', ['sender_id']);
        await queryInterface.addIndex('ticket_messages', ['created_at']);
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.dropTable('ticket_messages');
    }
};
