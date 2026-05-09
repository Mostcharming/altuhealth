'use strict';

module.exports = (sequelize, DataTypes) => {
    const Ticket = sequelize.define('Ticket', {
        id: {
            type: DataTypes.UUID,
            allowNull: false,
            primaryKey: true,
            defaultValue: DataTypes.UUIDV4,
            field: 'id'
        },
        ticketNumber: {
            type: DataTypes.INTEGER,
            allowNull: false,
            unique: true,
            autoIncrement: true,
            field: 'ticket_number',
            comment: 'Auto-incrementing ticket number (starting from 1)'
        },
        userId: {
            type: DataTypes.UUID,
            allowNull: false,
            field: 'user_id',
            comment: 'ID of the user who requested the ticket'
        },
        userType: {
            type: DataTypes.ENUM('Enrollee', 'RetailEnrollee', 'Provider', 'Doctor'),
            allowNull: false,
            field: 'user_type',
            comment: 'Type of user (Enrollee, RetailEnrollee, Provider, Doctor)'
        },
        subject: {
            type: DataTypes.STRING,
            allowNull: false,
            field: 'subject',
            comment: 'Subject of the ticket'
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: true,
            field: 'description',
            comment: 'Detailed description of the ticket'
        },
        category: {
            type: DataTypes.ENUM(
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
            field: 'category',
            comment: 'Category of the ticket'
        },
        status: {
            type: DataTypes.ENUM('pending', 'in_progress', 'on_hold', 'solved', 'closed'),
            allowNull: false,
            defaultValue: 'pending',
            field: 'status',
            comment: 'Status of the ticket'
        },
        priority: {
            type: DataTypes.ENUM('low', 'medium', 'high', 'urgent'),
            allowNull: false,
            defaultValue: 'medium',
            field: 'priority',
            comment: 'Priority level of the ticket'
        },
        assignedToId: {
            type: DataTypes.UUID,
            allowNull: true,
            field: 'assigned_to_id',
            comment: 'Admin ID if assigned to a specific admin'
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
        },
        closedAt: {
            type: DataTypes.DATE,
            allowNull: true,
            field: 'closed_at',
            comment: 'Timestamp when the ticket was closed'
        }
    }, {
        tableName: 'tickets',
        timestamps: true,
        underscored: true
    });

    return Ticket;
};
