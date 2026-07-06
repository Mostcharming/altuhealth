'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('messages', {
            id: {
                type: Sequelize.UUID,
                allowNull: false,
                primaryKey: true,
                defaultValue: Sequelize.UUIDV4,
                field: 'id'
            },
            conversation_id: {
                type: Sequelize.UUID,
                allowNull: false,
                references: {
                    model: 'conversations',
                    key: 'id'
                },
                onDelete: 'CASCADE',
                onUpdate: 'CASCADE',
                field: 'conversation_id'
            },
            sender_id: {
                type: Sequelize.UUID,
                allowNull: true,
                field: 'sender_id'
            },
            sender_type: {
                type: Sequelize.ENUM('Enrollee', 'RetailEnrollee', 'Provider', 'Staff', 'Admin', 'System'),
                allowNull: false,
                field: 'sender_type'
            },
            receiver_id: {
                type: Sequelize.UUID,
                allowNull: true,
                field: 'receiver_id'
            },
            receiver_type: {
                type: Sequelize.ENUM('Enrollee', 'RetailEnrollee', 'Provider', 'Staff', 'Admin', 'System'),
                allowNull: false,
                field: 'receiver_type'
            },
            message_type: {
                type: Sequelize.ENUM('text', 'attachment', 'system', 'status_update', 'assignment', 'note'),
                allowNull: false,
                defaultValue: 'text',
                field: 'message_type'
            },
            subject: {
                type: Sequelize.STRING,
                allowNull: true,
                field: 'subject'
            },
            content: {
                type: Sequelize.TEXT,
                allowNull: false,
                field: 'content'
            },
            attachment_url: {
                type: Sequelize.STRING,
                allowNull: true,
                field: 'attachment_url'
            },
            attachment_type: {
                type: Sequelize.STRING,
                allowNull: true,
                field: 'attachment_type'
            },
            attachment_name: {
                type: Sequelize.STRING,
                allowNull: true,
                field: 'attachment_name'
            },
            status: {
                type: Sequelize.ENUM('sent', 'read', 'archived'),
                allowNull: false,
                defaultValue: 'sent',
                field: 'status'
            },
            is_internal: {
                type: Sequelize.BOOLEAN,
                allowNull: false,
                defaultValue: false,
                field: 'is_internal'
            },
            read_at: {
                type: Sequelize.DATE,
                allowNull: true,
                field: 'read_at'
            },
            related_message_id: {
                type: Sequelize.UUID,
                allowNull: true,
                field: 'related_message_id'
            },
            system_metadata: {
                type: Sequelize.JSON,
                allowNull: true,
                field: 'system_metadata'
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
        await queryInterface.addIndex('messages', ['conversation_id']);
        await queryInterface.addIndex('messages', ['sender_id', 'sender_type']);
        await queryInterface.addIndex('messages', ['receiver_id', 'receiver_type']);
        await queryInterface.addIndex('messages', ['message_type']);
        await queryInterface.addIndex('messages', ['status']);
        await queryInterface.addIndex('messages', ['is_internal']);
        await queryInterface.addIndex('messages', ['created_at']);
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('messages');
    }
};
