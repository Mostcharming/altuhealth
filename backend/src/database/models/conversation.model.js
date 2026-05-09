'use strict';

module.exports = (sequelize, DataTypes) => {
    const Conversation = sequelize.define('Conversation', {
        id: {
            type: DataTypes.UUID,
            allowNull: false,
            primaryKey: true,
            defaultValue: DataTypes.UUIDV4,
            field: 'id'
        },
        conversationType: {
            type: DataTypes.ENUM('message', 'ticket'),
            allowNull: false,
            defaultValue: 'message',
            field: 'conversation_type',
            comment: 'Type of conversation: message or ticket'
        },
        senderId: {
            type: DataTypes.UUID,
            allowNull: true,
            field: 'sender_id',
            comment: 'Sender ID (null if senderType is Admin/System)'
        },
        senderType: {
            type: DataTypes.ENUM('Enrollee', 'RetailEnrollee', 'Provider', 'Staff', 'Admin', 'System'),
            allowNull: false,
            field: 'sender_type',
            comment: 'Type of sender'
        },
        receiverId: {
            type: DataTypes.UUID,
            allowNull: true,
            field: 'receiver_id',
            comment: 'Receiver ID (null if receiverType is Admin/System)'
        },
        receiverType: {
            type: DataTypes.ENUM('Enrollee', 'RetailEnrollee', 'Provider', 'Staff', 'Admin', 'System'),
            allowNull: false,
            field: 'receiver_type',
            comment: 'Type of receiver'
        },
        subject: {
            type: DataTypes.STRING,
            allowNull: false,
            field: 'subject',
            comment: 'Subject of the conversation/ticket'
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: true,
            field: 'description',
            comment: 'Initial description or context'
        },
        status: {
            type: DataTypes.ENUM('open', 'in_progress', 'solved', 'on_hold', 'closed', 'reopened'),
            allowNull: false,
            defaultValue: 'open',
            field: 'status',
            comment: 'Current status of the conversation'
        },
        priority: {
            type: DataTypes.ENUM('low', 'medium', 'high', 'urgent'),
            allowNull: false,
            defaultValue: 'medium',
            field: 'priority',
            comment: 'Priority level of the conversation/ticket'
        },
        category: {
            type: DataTypes.STRING,
            allowNull: true,
            field: 'category',
            comment: 'Category or department (e.g., billing, support, complaint)'
        },
        assignedToId: {
            type: DataTypes.UUID,
            allowNull: true,
            references: {
                model: 'admins',
                key: 'id'
            },
            onDelete: 'SET NULL',
            onUpdate: 'CASCADE',
            field: 'assigned_to_id',
            comment: 'Admin assigned to handle this conversation'
        },
        relatedEntityType: {
            type: DataTypes.STRING,
            allowNull: true,
            field: 'related_entity_type',
            comment: 'Type of related entity (e.g., Enrollee, Provider, Claim)'
        },
        relatedEntityId: {
            type: DataTypes.UUID,
            allowNull: true,
            field: 'related_entity_id',
            comment: 'ID of the related entity'
        },
        messageCount: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 1,
            field: 'message_count',
            comment: 'Total number of messages in this conversation'
        },
        lastMessageAt: {
            type: DataTypes.DATE,
            allowNull: true,
            field: 'last_message_at',
            comment: 'Timestamp of the last message'
        },
        resolvedAt: {
            type: DataTypes.DATE,
            allowNull: true,
            field: 'resolved_at',
            comment: 'When the conversation was resolved/solved'
        },
        closedAt: {
            type: DataTypes.DATE,
            allowNull: true,
            field: 'closed_at',
            comment: 'When the conversation was closed'
        },
        notes: {
            type: DataTypes.TEXT,
            allowNull: true,
            field: 'notes',
            comment: 'Internal notes'
        },
        isArchived: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
            field: 'is_archived',
            comment: 'Whether the conversation is archived'
        },
        createdAt: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
            field: 'created_at'
        },
        updatedAt: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
            field: 'updated_at'
        }
    }, {
        tableName: 'conversations',
        timestamps: true,
        underscored: true
    });

    return Conversation;
};
