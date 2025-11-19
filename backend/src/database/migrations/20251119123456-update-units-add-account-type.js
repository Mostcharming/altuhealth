'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        // Add account_type enum column (allowNull temporarily false with default to backfill existing rows)
        await queryInterface.addColumn('units', 'account_type', {
            type: Sequelize.ENUM('admin', 'enrollee', 'provider', 'corporate'),
            allowNull: false,
            defaultValue: 'admin',
            field: 'account_type'
        });

        // Ensure any existing rows have a valid value (defensive)
        await queryInterface.sequelize.query("UPDATE units SET account_type = 'admin' WHERE account_type IS NULL;");

        // Remove the default value so the column matches the model (no default)
        // Different dialects handle defaults differently; changeColumn should remove the default when not provided
        await queryInterface.changeColumn('units', 'account_type', {
            type: Sequelize.ENUM('admin', 'enrollee', 'provider', 'corporate'),
            allowNull: false,
            field: 'account_type'
        });

        // Remove description column (model doesn't include it)
        const tableDescription = await queryInterface.describeTable('units').catch(() => ({}));
        if (tableDescription && tableDescription.description) {
            await queryInterface.removeColumn('units', 'description');
        }
    },

    async down(queryInterface, Sequelize) {
        // Add description column back (if needed)
        const tableDescription = await queryInterface.describeTable('units').catch(() => ({}));
        if (!tableDescription || !tableDescription.description) {
            await queryInterface.addColumn('units', 'description', {
                type: Sequelize.STRING,
                allowNull: true
            });
        }

        // Remove account_type column
        await queryInterface.removeColumn('units', 'account_type');

        // Drop ENUM type in Postgres (Sequelize creates an enum type named enum_<table>_<column>)
        if (queryInterface.sequelize.getDialect() === 'postgres') {
            await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_units_account_type";');
        }
    }
};
