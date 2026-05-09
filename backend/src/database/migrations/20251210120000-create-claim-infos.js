'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('claim_infos', {
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
            service_date: {
                type: Sequelize.DATE,
                allowNull: false,
                field: 'service_date'
            },
            claim_amount: {
                type: Sequelize.DECIMAL(15, 2),
                allowNull: false,
                defaultValue: 0,
                field: 'claim_amount'
            },
            approved_amount: {
                type: Sequelize.DECIMAL(15, 2),
                allowNull: false,
                defaultValue: 0,
                field: 'approved_amount'
            },
            status: {
                type: Sequelize.ENUM('pending', 'approved', 'rejected', 'partially_approved', 'under_review'),
                allowNull: false,
                defaultValue: 'pending',
                field: 'status'
            },
            service_type: {
                type: Sequelize.STRING,
                allowNull: true,
                field: 'service_type'
            },
            description: {
                type: Sequelize.TEXT,
                allowNull: true,
                field: 'description'
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
        await queryInterface.addIndex('claim_infos', ['payment_batch_detail_id']);
        await queryInterface.addIndex('claim_infos', ['enrollee_id']);
        await queryInterface.addIndex('claim_infos', ['claim_number']);
        await queryInterface.addIndex('claim_infos', ['status']);
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('claim_infos');
    }
};
