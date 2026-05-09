'use strict';

module.exports = (sequelize, DataTypes) => {
    const TicketMessage = sequelize.define('TicketMessage', {
        id: {
            type: DataTypes.UUID,
            allowNull: false,
            primaryKey: true,
            defaultValue: DataTypes.UUIDV4,
            field: 'id'
        },
        ticketId: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: 'tickets',
                key: 'id'
            },
            onDelete: 'CASCADE',
            onUpdate: 'CASCADE',
            field: 'ticket_id',
            comment: 'Reference to the parent ticket'
        },
        senderId: {
            type: DataTypes.UUID,
            allowNull: false,
            field: 'sender_id',
            comment: 'ID of the user sending the message'
        },
        senderType: {
            type: DataTypes.ENUM('Enrollee', 'RetailEnrollee', 'Provider', 'Doctor', 'Admin', 'System'),
            allowNull: false,
            field: 'sender_type',
            comment: 'Type of user sending the message'
        },
        messageType: {
            type: DataTypes.ENUM('text', 'attachment', 'system', 'status_update', 'note'),
            allowNull: false,
            defaultValue: 'text',
            field: 'message_type',
            comment: 'Type of message content'
        },
        content: {
            type: DataTypes.TEXT,
            allowNull: true,
            field: 'content',
            comment: 'Message content (text)'
        },
        attachmentUrl: {
            type: DataTypes.STRING,
            allowNull: true,
            field: 'attachment_url',
            comment: 'URL of attached image or file'
        },
        attachmentType: {
            type: DataTypes.ENUM('image', 'document', 'other'),
            allowNull: true,
            field: 'attachment_type',
            comment: 'Type of attachment'
        },
        attachmentName: {
            type: DataTypes.STRING,
            allowNull: true,
            field: 'attachment_name',
            comment: 'Original name of the attachment'
        },
        isInternal: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
            field: 'is_internal',
            comment: 'Whether this is an internal note (only visible to admins)'
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
        tableName: 'ticket_messages',
        timestamps: true,
        underscored: true
    });

    return TicketMessage;
};
