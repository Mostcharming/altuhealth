'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.createTable('payment_advices', {
            id: {
                type: Sequelize.UUID,
                allowNull: false,
                primaryKey: true,
                defaultValue: Sequelize.UUIDV4,
            },
            payment_advice_number: {
                type: Sequelize.STRING,
                allowNull: false,
                unique: true,
            },
            provider_id: {
                type: Sequelize.UUID,
                allowNull: false,
                references: {
                    model: 'providers',
                    key: 'id',
                },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE',
            },
            payment_batch_id: {
                type: Sequelize.UUID,
                allowNull: true,
                references: {
                    model: 'payment_batches',
                    key: 'id',
                },
                onUpdate: 'CASCADE',
                onDelete: 'SET NULL',
            },
            total_amount: {
                type: Sequelize.DECIMAL(15, 2),
                allowNull: false,
                defaultValue: 0,
            },
            number_of_claims: {
                type: Sequelize.INTEGER,
                allowNull: false,
                defaultValue: 0,
            },
            payment_date: {
                type: Sequelize.DATE,
                allowNull: false,
            },
            due_date: {
                type: Sequelize.DATE,
                allowNull: true,
            },
            payment_method: {
                type: Sequelize.ENUM('bank_transfer', 'check', 'cash', 'mobile_money'),
                allowNull: false,
                defaultValue: 'bank_transfer',
            },
            bank_name: {
                type: Sequelize.STRING,
                allowNull: true,
            },
            bank_account_number: {
                type: Sequelize.STRING,
                allowNull: true,
            },
            account_name: {
                type: Sequelize.STRING,
                allowNull: true,
            },
            account_type: {
                type: Sequelize.STRING,
                allowNull: true,
            },
            sort_code: {
                type: Sequelize.STRING,
                allowNull: true,
            },
            routing_number: {
                type: Sequelize.STRING,
                allowNull: true,
            },
            description: {
                type: Sequelize.TEXT,
                allowNull: true,
            },
            status: {
                type: Sequelize.ENUM('draft', 'approved', 'sent', 'acknowledged', 'cancelled'),
                allowNull: false,
                defaultValue: 'draft',
            },
            attachment_url: {
                type: Sequelize.STRING,
                allowNull: true,
            },
            approved_by: {
                type: Sequelize.UUID,
                allowNull: true,
                references: {
                    model: 'admins',
                    key: 'id',
                },
                onUpdate: 'CASCADE',
                onDelete: 'SET NULL',
            },
            approved_at: {
                type: Sequelize.DATE,
                allowNull: true,
            },
            sent_at: {
                type: Sequelize.DATE,
                allowNull: true,
            },
            acknowledged_at: {
                type: Sequelize.DATE,
                allowNull: true,
            },
            notes: {
                type: Sequelize.TEXT,
                allowNull: true,
            },
            created_by: {
                type: Sequelize.UUID,
                allowNull: true,
                references: {
                    model: 'admins',
                    key: 'id',
                },
                onUpdate: 'CASCADE',
                onDelete: 'SET NULL',
            },
            created_at: {
                type: Sequelize.DATE,
                allowNull: false,
                defaultValue: Sequelize.NOW,
            },
            updated_at: {
                type: Sequelize.DATE,
                allowNull: false,
                defaultValue: Sequelize.NOW,
            },
        });
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.dropTable('payment_advices');
    },
};
