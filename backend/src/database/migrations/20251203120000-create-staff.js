'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        // Create staffs table
        await queryInterface.createTable('staffs', {
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
            last_name: {
                type: Sequelize.STRING,
                allowNull: false
            },
            email: {
                type: Sequelize.STRING,
                allowNull: false,
                unique: true
            },
            phone_number: {
                type: Sequelize.STRING,
                allowNull: false
            },
            staff_id: {
                type: Sequelize.STRING,
                allowNull: false,
                unique: true
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
            subsidiary_id: {
                type: Sequelize.UUID,
                allowNull: true,
                references: {
                    model: 'company_subsidiaries',
                    key: 'id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'SET NULL'
            },
            enrollment_status: {
                type: Sequelize.ENUM('enrolled', 'not_enrolled'),
                allowNull: false,
                defaultValue: 'not_enrolled'
            },
            is_notified: {
                type: Sequelize.BOOLEAN,
                allowNull: false,
                defaultValue: false
            },
            notified_at: {
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
        await queryInterface.addIndex('staffs', ['company_id']);
        await queryInterface.addIndex('staffs', ['subsidiary_id']);
        await queryInterface.addIndex('staffs', ['staff_id']);
        await queryInterface.addIndex('staffs', ['email']);
        await queryInterface.addIndex('staffs', ['enrollment_status']);
        await queryInterface.addIndex('staffs', ['is_notified']);
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('staffs');

        // Drop ENUM type for Postgres
        if (queryInterface.sequelize.getDialect() === 'postgres') {
            await queryInterface.sequelize.query("DROP TYPE IF EXISTS \"enum_staffs_enrollment_status\";");
        }
    }
};
