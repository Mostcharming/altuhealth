'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        // add snake_case timestamp columns
        await queryInterface.addColumn('audit_logs', 'created_at', {
            type: Sequelize.DATE,
            allowNull: false,
            defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
        });

        await queryInterface.addColumn('audit_logs', 'updated_at', {
            type: Sequelize.DATE,
            allowNull: false,
            defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
        });

        // best-effort: copy existing camelCase timestamp values into the new snake_case columns
        // use try/catch because identifier quoting differs across dialects
        try {
            await queryInterface.sequelize.query(
                `UPDATE audit_logs SET created_at = "createdAt" WHERE "createdAt" IS NOT NULL`
            );
            await queryInterface.sequelize.query(
                `UPDATE audit_logs SET updated_at = "updatedAt" WHERE "updatedAt" IS NOT NULL`
            );
        } catch (err) {
            // ignore errors from dialect differences; migration still adds the columns
        }
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.removeColumn('audit_logs', 'created_at');
        await queryInterface.removeColumn('audit_logs', 'updated_at');
    }
};
