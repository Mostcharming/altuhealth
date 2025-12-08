'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('payment_batch_details', {
            id: {
                type: Sequelize.UUID,
                allowNull: false,
                primaryKey: true,
                defaultValue: Sequelize.UUIDV4,
                field: 'id'
            },
            payment_batch_id: {
                type: Sequelize.UUID,
                allowNull: false,
                references: {
                    model: 'payment_batches',
                    key: 'id'
                },
                onDelete: 'CASCADE',
                onUpdate: 'CASCADE',
                field: 'payment_batch_id'
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
            period: {
                type: Sequelize.STRING,
                allowNull: false,
                field: 'period'
            },
            claims_count: {
                type: Sequelize.INTEGER,
                allowNull: false,
                defaultValue: 0,
                field: 'claims_count'
            },
            reconciliation_count: {
                type: Sequelize.INTEGER,
                allowNull: false,
                defaultValue: 0,
                field: 'reconciliation_count'
            },
            reconciliation_amount: {
                type: Sequelize.DECIMAL(15, 2),
                allowNull: false,
                defaultValue: 0,
                field: 'reconciliation_amount'
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
        await queryInterface.addIndex('payment_batch_details', ['payment_batch_id']);
        await queryInterface.addIndex('payment_batch_details', ['provider_id']);
        await queryInterface.addIndex('payment_batch_details', ['payment_batch_id', 'provider_id'], { unique: true });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('payment_batch_details');
    }
};
