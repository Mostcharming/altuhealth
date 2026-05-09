'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('conflicts', {
            id: {
                type: Sequelize.UUID,
                allowNull: false,
                primaryKey: true,
                defaultValue: Sequelize.UUIDV4,
                field: 'id'
            },
            payment_batch_detail_id: {
                type: Sequelize.UUID,
                allowNull: false,
                references: {
                    model: 'payment_batch_details',
                    key: 'id'
                },
                onDelete: 'CASCADE',
                onUpdate: 'CASCADE',
                field: 'payment_batch_detail_id'
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
            claim_number: {
                type: Sequelize.STRING,
                allowNull: false,
                field: 'claim_number'
            },
            conflict_type: {
                type: Sequelize.ENUM('amount_mismatch', 'duplicate_claim', 'missing_documentation', 'coverage_issue', 'other'),
                allowNull: false,
                field: 'conflict_type'
            },
            description: {
                type: Sequelize.TEXT,
                allowNull: false,
                field: 'description'
            },
            claimed_amount: {
                type: Sequelize.DECIMAL(15, 2),
                allowNull: false,
                defaultValue: 0,
                field: 'claimed_amount'
            },
            resolved_amount: {
                type: Sequelize.DECIMAL(15, 2),
                allowNull: true,
                defaultValue: 0,
                field: 'resolved_amount'
            },
            resolution_comment: {
                type: Sequelize.TEXT,
                allowNull: true,
                field: 'resolution_comment'
            },
            status: {
                type: Sequelize.ENUM('open', 'in_progress', 'resolved', 'escalated'),
                allowNull: false,
                defaultValue: 'open',
                field: 'status'
            },
            assigned_to: {
                type: Sequelize.UUID,
                allowNull: true,
                references: {
                    model: 'admins',
                    key: 'id'
                },
                onDelete: 'SET NULL',
                onUpdate: 'CASCADE',
                field: 'assigned_to'
            },
            resolved_date: {
                type: Sequelize.DATE,
                allowNull: true,
                field: 'resolved_date'
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

        // Add indexes for faster queries
        await queryInterface.addIndex('conflicts', ['payment_batch_detail_id']);
        await queryInterface.addIndex('conflicts', ['enrollee_id']);
        await queryInterface.addIndex('conflicts', ['claim_number']);
        await queryInterface.addIndex('conflicts', ['status']);
        await queryInterface.addIndex('conflicts', ['assigned_to']);
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('conflicts');
    }
};
