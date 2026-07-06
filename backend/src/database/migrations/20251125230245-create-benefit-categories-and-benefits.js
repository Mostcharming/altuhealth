'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        // Create benefit_categories table first (parent table)
        await queryInterface.createTable('benefit_categories', {
            id: {
                type: Sequelize.UUID,
                allowNull: false,
                primaryKey: true,
                defaultValue: Sequelize.UUIDV4
            },
            name: {
                type: Sequelize.STRING,
                allowNull: false
            },
            count: {
                type: Sequelize.INTEGER,
                allowNull: false,
                defaultValue: 0
            },
            created_at: {
                type: Sequelize.DATE,
                allowNull: false,
                defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
            },
            updated_at: {
                type: Sequelize.DATE,
                allowNull: false,
                defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
            }
        });

        // Create benefits table (child table with foreign key)
        await queryInterface.createTable('benefits', {
            id: {
                type: Sequelize.UUID,
                allowNull: false,
                primaryKey: true,
                defaultValue: Sequelize.UUIDV4
            },
            name: {
                type: Sequelize.STRING,
                allowNull: false
            },
            description: {
                type: Sequelize.TEXT,
                allowNull: true
            },
            limit: {
                type: Sequelize.STRING,
                allowNull: true
            },
            amount: {
                type: Sequelize.DECIMAL(10, 2),
                allowNull: false
            },
            benefit_category_id: {
                type: Sequelize.UUID,
                allowNull: false,
                references: {
                    model: 'benefit_categories',
                    key: 'id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'RESTRICT'
            },
            created_at: {
                type: Sequelize.DATE,
                allowNull: false,
                defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
            },
            updated_at: {
                type: Sequelize.DATE,
                allowNull: false,
                defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
            }
        });

        // Add indexes for better query performance
        await queryInterface.addIndex('benefit_categories', ['name']);
        await queryInterface.addIndex('benefits', ['name']);
        await queryInterface.addIndex('benefits', ['benefit_category_id']);
    },

    async down(queryInterface, Sequelize) {
        // Drop tables in reverse order (child first, then parent)
        await queryInterface.dropTable('benefits');
        await queryInterface.dropTable('benefit_categories');
    }
};
