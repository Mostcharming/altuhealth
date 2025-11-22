"use strict";

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.createTable("plans", {
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
            code: {
                type: Sequelize.STRING,
                allowNull: false,
                unique: true,
                field: 'code'
            },
            description: {
                type: Sequelize.TEXT,
                allowNull: true,
                field: 'description'
            },
            status: {
                type: Sequelize.STRING,
                allowNull: false,
                defaultValue: 'pending',
                field: 'status'
            },
            is_active: {
                type: Sequelize.BOOLEAN,
                allowNull: false,
                defaultValue: false,
                field: 'is_active'
            },
            is_approved: {
                type: Sequelize.BOOLEAN,
                allowNull: false,
                defaultValue: false,
                field: 'is_approved'
            },
            created_at: {
                allowNull: false,
                type: Sequelize.DATE,
                defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
                field: 'created_at'
            },
            updated_at: {
                allowNull: false,
                type: Sequelize.DATE,
                defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
                field: 'updated_at'
            }
        });
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.dropTable("plans");
    }
};
