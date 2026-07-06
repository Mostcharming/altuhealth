'use strict';
const { v4: uuidv4 } = require('uuid');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        const now = new Date();

        await queryInterface.bulkInsert('jobs', [
            {
                id: uuidv4(),
                name: 'COMPANY_SUBSCRIPTION_EXPIRY_REMINDER',
                description: 'Send reminders to companies about upcoming subscription expirations',
                frequency: 'daily',
                cron_expression: '0 9 * * *', // Daily at 9 AM
                is_active: true,
                last_run_at: null,
                next_run_at: null,
                last_status: 'pending',
                last_error_message: null,
                last_success_at: null,
                total_runs: 0,
                total_successful_runs: 0,
                total_failed_runs: 0,
                average_execution_time: null,
                job_handler: 'jobs/subscriptionReminderJob',
                metadata: null,
                created_at: now,
                updated_at: now
            },
            {
                id: uuidv4(),
                name: 'SUBSCRIPTION_EXPIRY_REMINDER',
                description: 'Send reminders to retail enrollees about upcoming subscription expirations',
                frequency: 'daily',
                cron_expression: '0 10 * * *', // Daily at 10 AM
                is_active: true,
                last_run_at: null,
                next_run_at: null,
                last_status: 'pending',
                last_error_message: null,
                last_success_at: null,
                total_runs: 0,
                total_successful_runs: 0,
                total_failed_runs: 0,
                average_execution_time: null,
                job_handler: 'jobs/retailSubscriptionReminderJob',
                metadata: null,
                created_at: now,
                updated_at: now
            }
        ], {});
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.bulkDelete('jobs', {
            name: ['COMPANY_SUBSCRIPTION_EXPIRY_REMINDER', 'SUBSCRIPTION_EXPIRY_REMINDER']
        }, {});
    }
};
