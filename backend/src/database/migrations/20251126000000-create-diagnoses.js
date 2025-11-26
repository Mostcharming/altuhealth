'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('diagnoses', {
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


            severity: {
                type: Sequelize.ENUM('mild', 'moderate', 'severe', 'critical'),
                allowNull: true,
                field: 'severity'
            },

            symptoms: {
                type: Sequelize.TEXT,
                allowNull: true,
                field: 'symptoms'
            },
            treatment: {
                type: Sequelize.TEXT,
                allowNull: true,
                field: 'treatment'
            },
            is_chronic_condition: {
                type: Sequelize.BOOLEAN,
                allowNull: false,
                defaultValue: false,
                field: 'is_chronic_condition'
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
        await queryInterface.addIndex('diagnoses', ['name']);
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('diagnoses');
    }
};
