'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('appointments', {
            id: {
                type: Sequelize.UUID,
                allowNull: false,
                primaryKey: true,
                defaultValue: Sequelize.UUIDV4,
                field: 'id'
            },
            enrollee_id: {
                type: Sequelize.UUID,
                allowNull: false,
                references: {
                    model: 'enrollees',
                    key: 'id'
                },
                onDelete: 'CASCADE',
                onUpdate: 'CASCADE',
                field: 'enrollee_id'
            },
            provider_id: {
                type: Sequelize.UUID,
                allowNull: false,
                references: {
                    model: 'providers',
                    key: 'id'
                },
                onDelete: 'CASCADE',
                onUpdate: 'CASCADE',
                field: 'provider_id'
            },
            company_id: {
                type: Sequelize.UUID,
                allowNull: false,
                references: {
                    model: 'companies',
                    key: 'id'
                },
                onDelete: 'CASCADE',
                onUpdate: 'CASCADE',
                field: 'company_id'
            },
            subsidiary_id: {
                type: Sequelize.UUID,
                allowNull: true,
                references: {
                    model: 'company_subsidiaries',
                    key: 'id'
                },
                onDelete: 'SET NULL',
                onUpdate: 'CASCADE',
                field: 'subsidiary_id'
            },
            complaint: {
                type: Sequelize.TEXT,
                allowNull: true,
                field: 'complaint'
            },
            appointment_date_time: {
                type: Sequelize.DATE,
                allowNull: false,
                field: 'appointment_date_time'
            },
            approved_by: {
                type: Sequelize.UUID,
                allowNull: true,
                references: {
                    model: 'admins',
                    key: 'id'
                },
                onDelete: 'SET NULL',
                onUpdate: 'CASCADE',
                field: 'approved_by'
            },
            rejected_by: {
                type: Sequelize.UUID,
                allowNull: true,
                references: {
                    model: 'admins',
                    key: 'id'
                },
                onDelete: 'SET NULL',
                onUpdate: 'CASCADE',
                field: 'rejected_by'
            },
            rejection_reason: {
                type: Sequelize.TEXT,
                allowNull: true,
                field: 'rejection_reason'
            },
            status: {
                type: Sequelize.ENUM('pending', 'approved', 'rejected', 'attended', 'missed', 'cancelled', 'rescheduled'),
                allowNull: false,
                defaultValue: 'pending',
                field: 'status'
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
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('appointments');
    }
};
