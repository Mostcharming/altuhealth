'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        const transaction = await queryInterface.sequelize.transaction();
        try {
            await queryInterface.createTable(
                'jobs',
                {
                    id: {
                        type: Sequelize.UUID,
                        allowNull: false,
                        primaryKey: true,
                        defaultValue: Sequelize.UUIDV4
                    },
                    name: {
                        type: Sequelize.STRING,
                        allowNull: false,
                        unique: true,
                        comment: 'Unique job name (e.g., SUBSCRIPTION_EXPIRY_REMINDER)'
                    },
                    description: {
                        type: Sequelize.TEXT,
                        allowNull: true,
                        comment: 'Human-readable description of what the job does'
                    },
                    frequency: {
                        type: Sequelize.ENUM(
                            'once',
                            'hourly',
                            'daily',
                            'weekly',
                            'biweekly',
                            'monthly',
                            'quarterly',
                            'annually'
                        ),
                        allowNull: false,
                        comment: 'How often the job should run'
                    },
                    cron_expression: {
                        type: Sequelize.STRING,
                        allowNull: false,
                        comment: 'Cron expression for scheduling (e.g., 0 9 * * *)'
                    },
                    is_active: {
                        type: Sequelize.BOOLEAN,
                        allowNull: false,
                        defaultValue: true,
                        comment: 'Whether the job is active and should run'
                    },
                    last_run_at: {
                        type: Sequelize.DATE,
                        allowNull: true,
                        comment: 'Timestamp of the last execution'
                    },
                    next_run_at: {
                        type: Sequelize.DATE,
                        allowNull: true,
                        comment: 'Timestamp of the next scheduled execution'
                    },
                    last_status: {
                        type: Sequelize.ENUM('pending', 'running', 'success', 'failed'),
                        allowNull: false,
                        defaultValue: 'pending',
                        comment: 'Status of the last run'
                    },
                    last_error_message: {
                        type: Sequelize.TEXT,
                        allowNull: true,
                        comment: 'Error message if the last run failed'
                    },
                    last_success_at: {
                        type: Sequelize.DATE,
                        allowNull: true,
                        comment: 'Timestamp of the last successful execution'
                    },
                    total_runs: {
                        type: Sequelize.INTEGER,
                        allowNull: false,
                        defaultValue: 0,
                        comment: 'Total number of times the job has run'
                    },
                    total_successful_runs: {
                        type: Sequelize.INTEGER,
                        allowNull: false,
                        defaultValue: 0,
                        comment: 'Number of successful runs'
                    },
                    total_failed_runs: {
                        type: Sequelize.INTEGER,
                        allowNull: false,
                        defaultValue: 0,
                        comment: 'Number of failed runs'
                    },
                    average_execution_time: {
                        type: Sequelize.INTEGER,
                        allowNull: true,
                        comment: 'Average execution time in milliseconds'
                    },
                    job_handler: {
                        type: Sequelize.STRING,
                        allowNull: false,
                        comment: 'Path to the job handler file (e.g., jobs/subscriptionReminder)'
                    },
                    metadata: {
                        type: Sequelize.JSON,
                        allowNull: true,
                        comment: 'Additional configuration or parameters for the job'
                    },
                    created_at: {
                        type: Sequelize.DATE,
                        allowNull: false,
                        defaultValue: Sequelize.NOW
                    },
                    updated_at: {
                        type: Sequelize.DATE,
                        allowNull: false,
                        defaultValue: Sequelize.NOW
                    }
                },
                { transaction }
            );

            // Create indexes
            await queryInterface.addIndex('jobs', ['name'], { transaction });
            await queryInterface.addIndex('jobs', ['is_active'], { transaction });
            await queryInterface.addIndex('jobs', ['last_status'], { transaction });
            await queryInterface.addIndex('jobs', ['next_run_at'], { transaction });

            await transaction.commit();
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    },

    async down(queryInterface, Sequelize) {
        const transaction = await queryInterface.sequelize.transaction();
        try {
            await queryInterface.dropTable('jobs', { transaction });
            await transaction.commit();
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }
};
