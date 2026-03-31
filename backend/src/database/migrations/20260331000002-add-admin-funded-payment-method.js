'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        // PostgreSQL specific - add enum value
        await queryInterface.sequelize.query(`
            ALTER TYPE enum_retail_enrollee_subscriptions_payment_method 
            ADD VALUE IF NOT EXISTS 'admin_funded'
        `);
    },

    down: async (queryInterface, Sequelize) => {
        // Note: In PostgreSQL, you cannot remove enum values directly
        // This migration is one-way, but we provide a comment for manual rollback if needed
        // To manually rollback:
        // 1. Create a backup of the enum type
        // 2. Drop the old type
        // 3. Create the new type without the 'admin_funded' value
        // 4. Update columns to use the new type
    }
};
