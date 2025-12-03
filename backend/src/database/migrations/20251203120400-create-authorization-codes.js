'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        // Create authorization_codes table
        await queryInterface.createTable('authorization_codes', {
            id: {
                type: Sequelize.UUID,
                allowNull: false,
                primaryKey: true,
                defaultValue: Sequelize.UUIDV4
            },
            authorization_code: {
                type: Sequelize.STRING,
                allowNull: false,
                unique: true
            },
            enrollee_id: {
                type: Sequelize.UUID,
                allowNull: false,
                references: {
                    model: 'enrollees',
                    key: 'id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE'
            },
            provider_id: {
                type: Sequelize.UUID,
                allowNull: true,
                references: {
                    model: 'providers',
                    key: 'id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'SET NULL'
            },
            diagnosis_id: {
                type: Sequelize.UUID,
                allowNull: true,
                references: {
                    model: 'diagnoses',
                    key: 'id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'SET NULL'
            },
            reason: {
                type: Sequelize.TEXT,
                allowNull: true
            },
            authorization_type: {
                type: Sequelize.ENUM('inpatient', 'outpatient', 'procedure', 'medication', 'diagnostic'),
                allowNull: false
            },
            valid_from: {
                type: Sequelize.DATE,
                allowNull: false
            },
            valid_to: {
                type: Sequelize.DATE,
                allowNull: false
            },
            amount_authorized: {
                type: Sequelize.DECIMAL(10, 2),
                allowNull: true
            },
            is_used: {
                type: Sequelize.BOOLEAN,
                allowNull: false,
                defaultValue: false
            },
            used_at: {
                type: Sequelize.DATE,
                allowNull: true
            },
            used_amount: {
                type: Sequelize.DECIMAL(10, 2),
                allowNull: true
            },
            status: {
                type: Sequelize.ENUM('active', 'used', 'expired', 'cancelled', 'pending'),
                allowNull: false,
                defaultValue: 'active'
            },
            notes: {
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
        await queryInterface.addIndex('authorization_codes', ['authorization_code']);
        await queryInterface.addIndex('authorization_codes', ['enrollee_id']);
        await queryInterface.addIndex('authorization_codes', ['provider_id']);
        await queryInterface.addIndex('authorization_codes', ['diagnosis_id']);
        await queryInterface.addIndex('authorization_codes', ['status']);
        await queryInterface.addIndex('authorization_codes', ['is_used']);
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('authorization_codes');

        // Drop ENUM types for Postgres
        if (queryInterface.sequelize.getDialect() === 'postgres') {
            await queryInterface.sequelize.query("DROP TYPE IF EXISTS \"enum_authorization_codes_authorization_type\";");
            await queryInterface.sequelize.query("DROP TYPE IF EXISTS \"enum_authorization_codes_status\";");
        }
    }
};
