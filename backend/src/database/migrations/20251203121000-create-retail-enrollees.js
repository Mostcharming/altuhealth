'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        // Create retail_enrollees table
        await queryInterface.createTable('retail_enrollees', {
            id: {
                type: Sequelize.UUID,
                allowNull: false,
                primaryKey: true,
                defaultValue: Sequelize.UUIDV4
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
                allowNull: false
            },
            email: {
                type: Sequelize.STRING,
                allowNull: false
            },
            date_of_birth: {
                type: Sequelize.DATE,
                allowNull: false
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
            max_dependents: {
                type: Sequelize.INTEGER,
                allowNull: true
            },
            plan_id: {
                type: Sequelize.UUID,
                allowNull: false,
                references: {
                    model: 'plans',
                    key: 'id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'RESTRICT'
            },
            subscription_start_date: {
                type: Sequelize.DATE,
                allowNull: false
            },
            subscription_end_date: {
                type: Sequelize.DATE,
                allowNull: true
            },
            sold_by_user_id: {
                type: Sequelize.UUID,
                allowNull: true,
                references: {
                    model: 'admins',
                    key: 'id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'SET NULL'
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
        await queryInterface.addIndex('retail_enrollees', ['email']);
        await queryInterface.addIndex('retail_enrollees', ['phone_number']);
        await queryInterface.addIndex('retail_enrollees', ['plan_id']);
        await queryInterface.addIndex('retail_enrollees', ['sold_by_user_id']);

        // Create retail_enrollee_next_of_kins table
        await queryInterface.createTable('retail_enrollee_next_of_kins', {
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
            email: {
                type: Sequelize.STRING,
                allowNull: true
            },
            phone_number: {
                type: Sequelize.STRING,
                allowNull: false
            },
            address: {
                type: Sequelize.TEXT,
                allowNull: true
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
        await queryInterface.addIndex('retail_enrollee_next_of_kins', ['retail_enrollee_id']);
    },

    async down(queryInterface, Sequelize) {
        // Drop retail_enrollee_next_of_kins table first (due to foreign key constraint)
        await queryInterface.dropTable('retail_enrollee_next_of_kins');

        // Drop retail_enrollees table
        await queryInterface.dropTable('retail_enrollees');
    }
};
