'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('conversations', {
            id: {
                type: Sequelize.UUID,
                allowNull: false,
                primaryKey: true,
                defaultValue: Sequelize.UUIDV4,
                field: 'id'
            },
            conversation_type: {
                type: Sequelize.ENUM('message', 'ticket'),
                allowNull: false,
                defaultValue: 'message',
                field: 'conversation_type'
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
            subject: {
                type: Sequelize.STRING,
                allowNull: false,
                field: 'subject'
            },
            description: {
                type: Sequelize.TEXT,
                allowNull: true,
                field: 'description'
            },
            status: {
                type: Sequelize.ENUM('open', 'in_progress', 'solved', 'on_hold', 'closed', 'reopened'),
                allowNull: false,
                defaultValue: 'open',
                field: 'status'
            },
            priority: {
                type: Sequelize.ENUM('low', 'medium', 'high', 'urgent'),
                allowNull: false,
                defaultValue: 'medium',
                field: 'priority'
            },
            category: {
                type: Sequelize.STRING,
                allowNull: true,
                field: 'category'
            },
            assigned_to_id: {
                type: Sequelize.UUID,
                allowNull: true,
                references: {
                    model: 'admins',
                    key: 'id'
                },
                onDelete: 'SET NULL',
                onUpdate: 'CASCADE',
                field: 'assigned_to_id'
            },
            related_entity_type: {
                type: Sequelize.STRING,
                allowNull: true,
                field: 'related_entity_type'
            },
            related_entity_id: {
                type: Sequelize.UUID,
                allowNull: true,
                field: 'related_entity_id'
            },
            message_count: {
                type: Sequelize.INTEGER,
                allowNull: false,
                defaultValue: 1,
                field: 'message_count'
            },
            last_message_at: {
                type: Sequelize.DATE,
                allowNull: true,
                field: 'last_message_at'
            },
            resolved_at: {
                type: Sequelize.DATE,
                allowNull: true,
                field: 'resolved_at'
            },
            closed_at: {
                type: Sequelize.DATE,
                allowNull: true,
                field: 'closed_at'
            },
            notes: {
                type: Sequelize.TEXT,
                allowNull: true,
                field: 'notes'
            },
            is_archived: {
                type: Sequelize.BOOLEAN,
                allowNull: false,
                defaultValue: false,
                field: 'is_archived'
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
        await queryInterface.addIndex('conversations', ['sender_id', 'sender_type']);
        await queryInterface.addIndex('conversations', ['receiver_id', 'receiver_type']);
        await queryInterface.addIndex('conversations', ['assigned_to_id']);
        await queryInterface.addIndex('conversations', ['status']);
        await queryInterface.addIndex('conversations', ['conversation_type']);
        await queryInterface.addIndex('conversations', ['created_at']);
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('conversations');
    }
};
