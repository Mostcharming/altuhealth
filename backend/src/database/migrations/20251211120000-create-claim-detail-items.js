'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        // Create claim_detail_items table
        await queryInterface.createTable('claim_detail_items', {
            id: {
                type: Sequelize.UUID,
                allowNull: false,
                primaryKey: true,
                defaultValue: Sequelize.UUIDV4
            },
            claim_detail_id: {
                type: Sequelize.UUID,
                allowNull: false,
                references: {
                    model: 'claim_details',
                    key: 'id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE'
            },
            item_type: {
                type: Sequelize.ENUM('drug', 'service'),
                allowNull: false
            },
            item_id: {
                type: Sequelize.UUID,
                allowNull: false
            },
            item_name: {
                type: Sequelize.STRING,
                allowNull: false
            },
            quantity: {
                type: Sequelize.INTEGER,
                allowNull: false,
                defaultValue: 1
            },
            unit_price: {
                type: Sequelize.DECIMAL(15, 2),
                allowNull: false
            },
            total_amount: {
                type: Sequelize.DECIMAL(15, 2),
                allowNull: false
            },
            unit: {
                type: Sequelize.STRING,
                allowNull: true
            },
            description: {
                type: Sequelize.TEXT,
                allowNull: true
            },
            created_at: {
                type: Sequelize.DATE,
                allowNull: false,
                defaultValue: Sequelize.NOW
            },
            updated_at: {
                type: Sequelize.DATE,
                allowNull: false,
                defaultValue: Sequelize.NOW
            }
        });

        // Add indexes
        await queryInterface.addIndex('claim_detail_items', ['claim_detail_id']);
        await queryInterface.addIndex('claim_detail_items', ['item_id']);
        await queryInterface.addIndex('claim_detail_items', ['item_type']);
    },

    async down(queryInterface, Sequelize) {
        // Drop the table
        await queryInterface.dropTable('claim_detail_items');
    }
};
