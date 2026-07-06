'use strict';
const { v4: uuidv4 } = require('uuid');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        const now = new Date();

        await queryInterface.bulkInsert('jobs', [
            {
                id: uuidv4(),
                name: 'WOMEN_HEALTH_PERIOD_PREDICTION',
                description: 'Daily period prediction calculation for women health tracking',
                frequency: 'daily',
                cron_expression: '0 0 * * *', // Runs daily at midnight
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
                job_handler: 'jobs/periodPredictionJob',
                metadata: null,
                created_at: now,
                updated_at: now
            }
        ], {});
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.bulkDelete('jobs', {
            name: 'WOMEN_HEALTH_PERIOD_PREDICTION'
        }, {});
    }
};
