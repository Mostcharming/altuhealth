'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        // Create retail_enrollee_dependents table
        await queryInterface.createTable('retail_enrollee_dependents', {
            id: {
                type: Sequelize.UUID,
                allowNull: false,
                primaryKey: true,
                defaultValue: Sequelize.UUIDV4
            },
            retail_enrollee_id: {
                type: Sequelize.UUID,
                allowNull: false,
                references: {
                    model: 'retail_enrollees',
                    key: 'id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE'
            },
            first_name: {
                type: Sequelize.STRING,
                allowNull: false
            },
            middle_name: {
                type: Sequelize.STRING,
                allowNull: true
            },
            last_name: {
                type: Sequelize.STRING,
                allowNull: false
            },
            phone_number: {
                type: Sequelize.STRING,
                allowNull: true
            },
            email: {
                type: Sequelize.STRING,
                allowNull: true
            },
            date_of_birth: {
                type: Sequelize.DATE,
                allowNull: false
            },
            gender: {
                type: Sequelize.ENUM('male', 'female', 'other'),
                allowNull: false
            },
            relationship: {
                type: Sequelize.STRING,
                allowNull: false,
                comment: 'Relationship to the enrollee e.g., spouse, child, parent'
            },
            state: {
                type: Sequelize.STRING,
                allowNull: true
            },
            lga: {
                type: Sequelize.STRING,
                allowNull: true
            },
            country: {
                type: Sequelize.STRING,
                allowNull: true
            },
            address: {
                type: Sequelize.TEXT,
                allowNull: true
            },
            is_active: {
                type: Sequelize.BOOLEAN,
                allowNull: false,
                defaultValue: true
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

        // Add indexes
        await queryInterface.addIndex('retail_enrollee_dependents', ['retail_enrollee_id']);
        await queryInterface.addIndex('retail_enrollee_dependents', ['email']);
    },

    async down(queryInterface, Sequelize) {
        // Drop retail_enrollee_dependents table
        await queryInterface.dropTable('retail_enrollee_dependents');
    }
};
