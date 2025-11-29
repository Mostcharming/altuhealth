'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('providers', {
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
            category: {
                type: Sequelize.ENUM('primary', 'secondary', 'tertiary', 'specialized'),
                allowNull: false,
                field: 'category'
            },
            email: {
                type: Sequelize.STRING,
                allowNull: false,
                unique: true,
                field: 'email'
            },
            phone_number: {
                type: Sequelize.STRING,
                allowNull: false,
                field: 'phone_number'
            },
            secondary_phone_number: {
                type: Sequelize.STRING,
                allowNull: true,
                field: 'secondary_phone_number'
            },
            website: {
                type: Sequelize.STRING,
                allowNull: true,
                field: 'website'
            },
            region: {
                type: Sequelize.STRING,
                allowNull: true,
                field: 'region'
            },
            state: {
                type: Sequelize.STRING,
                allowNull: false,
                field: 'state'
            },
            lga: {
                type: Sequelize.STRING,
                allowNull: true,
                field: 'lga'
            },
            address: {
                type: Sequelize.STRING,
                allowNull: false,
                field: 'address'
            },
            provider_area: {
                type: Sequelize.STRING,
                allowNull: true,
                field: 'provider_area'
            },
            bank: {
                type: Sequelize.STRING,
                allowNull: false,
                field: 'bank'
            },
            account_name: {
                type: Sequelize.STRING,
                allowNull: false,
                field: 'account_name'
            },
            account_number: {
                type: Sequelize.STRING,
                allowNull: false,
                unique: true,
                field: 'account_number'
            },
            bank_branch: {
                type: Sequelize.STRING,
                allowNull: true,
                field: 'bank_branch'
            },
            payment_batch: {
                type: Sequelize.ENUM('batch_a', 'batch_b', 'batch_c', 'batch_d'),
                allowNull: false,
                defaultValue: 'batch_a',
                field: 'payment_batch'
            },
            manager_id: {
                type: Sequelize.UUID,
                allowNull: false,
                references: {
                    model: 'admins',
                    key: 'id'
                },
                field: 'manager_id'
            },
            provider_specialization_id: {
                type: Sequelize.UUID,
                allowNull: true,
                references: {
                    model: 'provider_specializations',
                    key: 'id'
                },
                field: 'provider_specialization_id'
            },
            status: {
                type: Sequelize.ENUM('active', 'inactive', 'suspended', 'pending_approval'),
                allowNull: false,
                defaultValue: 'pending_approval',
                field: 'status'
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
        await queryInterface.addIndex('providers', ['email']);
        await queryInterface.addIndex('providers', ['manager_id']);
        await queryInterface.addIndex('providers', ['provider_specialization_id']);
        await queryInterface.addIndex('providers', ['state']);
        await queryInterface.addIndex('providers', ['status']);
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('providers');
    }
};
