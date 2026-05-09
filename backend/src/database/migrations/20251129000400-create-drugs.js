'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('drugs', {
            id: {
                type: Sequelize.UUID,
                allowNull: false,
                primaryKey: true,
                defaultValue: Sequelize.UUIDV4,
                field: 'id'
            },
            name: {
                type: Sequelize.STRING,
                allowNull: false,
                field: 'name'
            },
            unit: {
                type: Sequelize.STRING,
                allowNull: false,
                field: 'unit'
            },
            description: {
                type: Sequelize.TEXT,
                allowNull: true,
                field: 'description'
            },
            strength: {
                type: Sequelize.STRING,
                allowNull: true,
                field: 'strength'
            },
            price: {
                type: Sequelize.DECIMAL(12, 2),
                allowNull: false,
                field: 'price'
            },
            status: {
                type: Sequelize.ENUM('active', 'inactive', 'pending'),
                allowNull: false,
                defaultValue: 'pending',
                field: 'status'
            },
            provider_id: {
                type: Sequelize.UUID,
                allowNull: false,
                references: {
                    model: 'providers',
                    key: 'id'
                },
                field: 'provider_id'
            },
            is_deleted: {
                type: Sequelize.BOOLEAN,
                allowNull: false,
                defaultValue: false,
                field: 'is_deleted'
            },
            created_at: {
                type: Sequelize.DATE,
                allowNull: false,
                field: 'created_at'
            },
            updated_at: {
                type: Sequelize.DATE,
                allowNull: false,
                field: 'updated_at'
            }
        });

        // Add indexes
        await queryInterface.addIndex('drugs', ['provider_id']);
        await queryInterface.addIndex('drugs', ['status']);
        await queryInterface.addIndex('drugs', ['name']);
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('drugs');
    }
};
