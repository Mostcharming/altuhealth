'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('retail_enrollee_dependent_medical_histories', {
            id: {
                type: Sequelize.UUID,
                allowNull: false,
                primaryKey: true,
                defaultValue: Sequelize.UUIDV4
            },
            retail_enrollee_dependent_id: {
                type: Sequelize.UUID,
                allowNull: false,
                references: {
                    model: 'retail_enrollee_dependents',
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
            evs_code: {
                type: Sequelize.STRING,
                allowNull: true
            },
            amount: {
                type: Sequelize.DECIMAL(10, 2),
                allowNull: true
            },
            service_date: {
                type: Sequelize.DATE,
                allowNull: true
            },
            notes: {
                type: Sequelize.TEXT,
                allowNull: true
            },
            attachment_url: {
                type: Sequelize.STRING,
                allowNull: true
            },
            status: {
                type: Sequelize.ENUM('pending', 'reviewed', 'approved', 'rejected'),
                allowNull: false,
                defaultValue: 'pending'
            },
            currency: {
                type: Sequelize.STRING,
                allowNull: false,
                defaultValue: 'NGN'
            },
            created_at: {
                type: Sequelize.DATE,
                allowNull: false,
                defaultValue: Sequelize.NOW
            },
            updated_at: {
                type: Sequelize.DATE,
                allowNull: false,
                defaultValue: Sequelize.NOW
            }
        });

        await queryInterface.addIndex('retail_enrollee_dependent_medical_histories', ['retail_enrollee_dependent_id']);
        await queryInterface.addIndex('retail_enrollee_dependent_medical_histories', ['provider_id']);
        await queryInterface.addIndex('retail_enrollee_dependent_medical_histories', ['diagnosis_id']);
        await queryInterface.addIndex('retail_enrollee_dependent_medical_histories', ['status']);
    },

    async down(queryInterface) {
        await queryInterface.dropTable('retail_enrollee_dependent_medical_histories');
        await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_retail_enrollee_dependent_medical_histories_status";');
    }
};
