'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('provider_specializations', {
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
            description: {
                type: Sequelize.TEXT,
                allowNull: true,
                field: 'description'
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
        await queryInterface.addIndex('provider_specializations', ['name']);
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('provider_specializations');
    }
};
