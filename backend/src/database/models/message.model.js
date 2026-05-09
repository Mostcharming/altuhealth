'use strict';

module.exports = (sequelize, DataTypes) => {
    const Message = sequelize.define('Message', {
        id: {
            type: DataTypes.UUID,
            allowNull: false,
            primaryKey: true,
            defaultValue: DataTypes.UUIDV4,
            field: 'id'
        },
        conversationId: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: 'conversations',
                key: 'id'
            },
            onDelete: 'CASCADE',
            onUpdate: 'CASCADE',
            field: 'conversation_id',
            comment: 'Reference to the parent conversation'
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
        messageType: {
            type: DataTypes.ENUM('text', 'attachment', 'system', 'status_update', 'assignment', 'note'),
            allowNull: false,
            defaultValue: 'text',
            field: 'message_type',
            comment: 'Type of message content'
        },
        subject: {
            type: DataTypes.STRING,
            allowNull: true,
            field: 'subject',
            comment: 'Subject (optional, mostly for formal messages)'
        },
        content: {
            type: DataTypes.TEXT,
            allowNull: false,
            field: 'content',
            comment: 'Message content'
        },
        attachmentUrl: {
            type: DataTypes.STRING,
            allowNull: true,
            field: 'attachment_url',
            comment: 'URL to attached file (if messageType is attachment)'
        },
        attachmentType: {
            type: DataTypes.STRING,
            allowNull: true,
            field: 'attachment_type',
            comment: 'Type of attachment (e.g., pdf, image, document)'
        },
        attachmentName: {
            type: DataTypes.STRING,
            allowNull: true,
            field: 'attachment_name',
            comment: 'Original name of the attachment'
        },
        status: {
            type: DataTypes.ENUM('sent', 'read', 'archived'),
            allowNull: false,
            defaultValue: 'sent',
            field: 'status',
            comment: 'Delivery and read status'
        },
        isInternal: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
            field: 'is_internal',
            comment: 'Whether this is an internal note (only visible to staff)'
        },
        readAt: {
            type: DataTypes.DATE,
            allowNull: true,
            field: 'read_at',
            comment: 'When the message was read'
        },
        relatedMessageId: {
            type: DataTypes.UUID,
            allowNull: true,
            field: 'related_message_id',
            comment: 'ID of the message being replied to'
        },
        systemMetadata: {
            type: DataTypes.JSON,
            allowNull: true,
            field: 'system_metadata',
            comment: 'Additional metadata for system messages'
        },
        notes: {
            type: DataTypes.TEXT,
            allowNull: true,
            field: 'notes',
            comment: 'Additional notes'
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
        tableName: 'messages',
        timestamps: true,
        underscored: true
    });

    return Message;
};
