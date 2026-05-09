'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        // Enable pgcrypto to use gen_random_uuid()
        await queryInterface.sequelize.query(`CREATE EXTENSION IF NOT EXISTS pgcrypto;`);

        await queryInterface.createTable('license', {
            id: {
                type: Sequelize.UUID,
                allowNull: false,
                primaryKey: true,
                defaultValue: Sequelize.literal('gen_random_uuid()')
            },
            expires_at: {
                type: Sequelize.DATE,
                allowNull: true
            },
            is_lifetime: {
                type: Sequelize.BOOLEAN,
                allowNull: false,
                defaultValue: false
            },
            created_at: {
                allowNull: false,
                type: Sequelize.DATE,
                defaultValue: Sequelize.literal('NOW()')
            },
            updated_at: {
                allowNull: false,
                type: Sequelize.DATE,
                defaultValue: Sequelize.literal('NOW()')
            }
        });

        // Add a constraint to ensure only one row exists
        await queryInterface.sequelize.query(`
      CREATE UNIQUE INDEX license_single_row_idx ON license ((1));
    `);
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.dropTable('license');
    }
};
