'use strict';
const { v4: uuidv4 } = require('uuid');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        const now = new Date();

        await queryInterface.bulkInsert('jobs', [
            {
                id: uuidv4(),
                name: 'ENROLLEE_BIRTHDAY_REMINDER',
                description: 'Send birthday reminders to company enrollees',
                frequency: 'daily',
                cron_expression: '0 8 * * *', // Daily at 8 AM
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
                job_handler: 'jobs/birthdayReminderJob',
                metadata: null,
                created_at: now,
                updated_at: now
            },
            {
                id: uuidv4(),
                name: 'ENROLLEE_DEPENDENT_BIRTHDAY_REMINDER',
                description: 'Send birthday reminders to company enrollee dependents',
                frequency: 'daily',
                cron_expression: '0 8 * * *', // Daily at 8 AM
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
                job_handler: 'jobs/birthdayReminderJob',
                metadata: null,
                created_at: now,
                updated_at: now
            },
            {
                id: uuidv4(),
                name: 'RETAIL_ENROLLEE_BIRTHDAY_REMINDER',
                description: 'Send birthday reminders to retail enrollees',
                frequency: 'daily',
                cron_expression: '0 8 * * *', // Daily at 8 AM
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
                job_handler: 'jobs/birthdayReminderJob',
                metadata: null,
                created_at: now,
                updated_at: now
            },
            {
                id: uuidv4(),
                name: 'RETAIL_ENROLLEE_DEPENDENT_BIRTHDAY_REMINDER',
                description: 'Send birthday reminders to retail enrollee dependents',
                frequency: 'daily',
                cron_expression: '0 8 * * *', // Daily at 8 AM
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
                job_handler: 'jobs/birthdayReminderJob',
                metadata: null,
                created_at: now,
                updated_at: now
            }
        ], {});
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.bulkDelete('jobs', {
            name: [
                'ENROLLEE_BIRTHDAY_REMINDER',
                'ENROLLEE_DEPENDENT_BIRTHDAY_REMINDER',
                'RETAIL_ENROLLEE_BIRTHDAY_REMINDER',
                'RETAIL_ENROLLEE_DEPENDENT_BIRTHDAY_REMINDER'
            ]
        }, {});
    }
};
