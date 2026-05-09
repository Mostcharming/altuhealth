'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        // Create enrollees table
        await queryInterface.createTable('enrollees', {
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
            policy_number: {
                type: Sequelize.STRING,
                allowNull: false,
                unique: true
            },
            staff_id: {
                type: Sequelize.UUID,
                allowNull: false,
                unique: true,
                references: {
                    model: 'staffs',
                    key: 'id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE'
            },
            company_id: {
                type: Sequelize.UUID,
                allowNull: false,
                references: {
                    model: 'companies',
                    key: 'id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'RESTRICT'
            },
            company_plan_id: {
                type: Sequelize.UUID,
                allowNull: false,
                references: {
                    model: 'company_plans',
                    key: 'id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'RESTRICT'
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
            address: {
                type: Sequelize.TEXT,
                allowNull: true
            },
            occupation: {
                type: Sequelize.STRING,
                allowNull: true
            },
            marital_status: {
                type: Sequelize.ENUM('single', 'married', 'divorced', 'widowed', 'separated'),
                allowNull: true
            },
            gender: {
                type: Sequelize.ENUM('male', 'female', 'other'),
                allowNull: false
            },
            phone_number: {
                type: Sequelize.STRING,
                allowNull: false
            },
            email: {
                type: Sequelize.STRING,
                allowNull: false,
                validate: {
                    isEmail: true
                }
            },
            max_dependents: {
                type: Sequelize.INTEGER,
                allowNull: true
            },
            preexisting_medical_records: {
                type: Sequelize.TEXT,
                allowNull: true
            },
            enrollment_date: {
                type: Sequelize.DATE,
                allowNull: false,
                defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
            },
            expiration_date: {
                type: Sequelize.DATE,
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
        await queryInterface.addIndex('enrollees', ['policy_number']);
        await queryInterface.addIndex('enrollees', ['staff_id']);
        await queryInterface.addIndex('enrollees', ['company_id']);
        await queryInterface.addIndex('enrollees', ['company_plan_id']);
        await queryInterface.addIndex('enrollees', ['email']);
        await queryInterface.addIndex('enrollees', ['is_active']);
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('enrollees');

        // Drop ENUM types for Postgres
        if (queryInterface.sequelize.getDialect() === 'postgres') {
            await queryInterface.sequelize.query("DROP TYPE IF EXISTS \"enum_enrollees_marital_status\";");
            await queryInterface.sequelize.query("DROP TYPE IF EXISTS \"enum_enrollees_gender\";");
        }
    }
};
