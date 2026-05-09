'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        // Step 1: Remove the foreign key constraint for company_plan_id
        await queryInterface.removeConstraint('staffs', 'staffs_company_plan_id_fkey');

        // Step 2: Remove the index on company_plan_id
        await queryInterface.removeIndex('staffs', 'staffs_company_plan_id');

        // Step 3: Rename company_plan_id to subscription_id
        await queryInterface.renameColumn('staffs', 'company_plan_id', 'subscription_id');

        // Step 4: Add foreign key constraint for subscription_id
        await queryInterface.addConstraint('staffs', {
            fields: ['subscription_id'],
            type: 'foreign key',
            name: 'staffs_subscription_id_fkey',
            references: {
                table: 'subscriptions',
                field: 'id'
            },
            onUpdate: 'CASCADE',
            onDelete: 'SET NULL'
        });

        // Step 5: Add index on subscription_id
        await queryInterface.addIndex('staffs', ['subscription_id']);
    },

    async down(queryInterface, Sequelize) {
        // Reverse the migration
        // Step 1: Remove the foreign key constraint for subscription_id
        await queryInterface.removeConstraint('staffs', 'staffs_subscription_id_fkey');

        // Step 2: Remove the index on subscription_id
        await queryInterface.removeIndex('staffs', 'staffs_subscription_id');

        // Step 3: Rename subscription_id back to company_plan_id
        await queryInterface.renameColumn('staffs', 'subscription_id', 'company_plan_id');

        // Step 4: Add foreign key constraint for company_plan_id
        await queryInterface.addConstraint('staffs', {
            fields: ['company_plan_id'],
            type: 'foreign key',
            name: 'staffs_company_plan_id_fkey',
            references: {
                table: 'company_plans',
                field: 'id'
            },
            onUpdate: 'CASCADE',
            onDelete: 'SET NULL'
        });

        // Step 5: Add index on company_plan_id
        await queryInterface.addIndex('staffs', ['company_plan_id']);
    }
};
