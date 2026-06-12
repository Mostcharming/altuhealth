'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.createTable('currency_rates', {
            id: {
                type: Sequelize.UUID,
                primaryKey: true,
                defaultValue: Sequelize.UUIDV4,
                allowNull: false
            },
            currency_code: {
                type: Sequelize.STRING(3),
                allowNull: false,
                unique: true
            },
            currency_name: {
                type: Sequelize.STRING,
                allowNull: false
            },
            rate_to_ngn: {
                type: Sequelize.DECIMAL(20, 8),
                allowNull: false,
                comment: 'NGN amount for one unit of this currency'
            },
            ngn_to_currency_rate: {
                type: Sequelize.DECIMAL(20, 8),
                allowNull: false,
                comment: 'Currency amount for one NGN'
            },
            source: {
                type: Sequelize.STRING,
                allowNull: false,
                defaultValue: 'manual'
            },
            source_payload: {
                type: Sequelize.JSON,
                allowNull: true
            },
            last_fetched_at: {
                type: Sequelize.DATE,
                allowNull: true
            },
            is_active: {
                type: Sequelize.BOOLEAN,
                allowNull: false,
                defaultValue: true
            },
            notes: {
                type: Sequelize.TEXT,
                allowNull: true
            },
            created_at: {
                type: Sequelize.DATE,
                defaultValue: Sequelize.NOW,
                allowNull: false
            },
            updated_at: {
                type: Sequelize.DATE,
                defaultValue: Sequelize.NOW,
                allowNull: false
            }
        });

        await queryInterface.addIndex('currency_rates', ['currency_code']);
        await queryInterface.addIndex('currency_rates', ['is_active']);
    },

    down: async (queryInterface) => {
        await queryInterface.dropTable('currency_rates');
    }
};
