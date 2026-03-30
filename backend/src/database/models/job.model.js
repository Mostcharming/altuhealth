'use strict';

module.exports = (sequelize, DataTypes) => {
    const Job = sequelize.define('Job', {
        id: {
            type: DataTypes.UUID,
            allowNull: false,
            primaryKey: true,
            defaultValue: DataTypes.UUIDV4,
            field: 'id'
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
            field: 'name',
            comment: 'Unique job name (e.g., SUBSCRIPTION_EXPIRY_REMINDER)'
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: true,
            field: 'description',
            comment: 'Human-readable description of what the job does'
        },
        frequency: {
            type: DataTypes.ENUM(
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
            field: 'frequency',
            comment: 'How often the job should run'
        },
        cronExpression: {
            type: DataTypes.STRING,
            allowNull: false,
            field: 'cron_expression',
            comment: 'Cron expression for scheduling (e.g., 0 9 * * *)'
        },
        isActive: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: true,
            field: 'is_active',
            comment: 'Whether the job is active and should run'
        },
        lastRunAt: {
            type: DataTypes.DATE,
            allowNull: true,
            field: 'last_run_at',
            comment: 'Timestamp of the last execution'
        },
        nextRunAt: {
            type: DataTypes.DATE,
            allowNull: true,
            field: 'next_run_at',
            comment: 'Timestamp of the next scheduled execution'
        },
        lastStatus: {
            type: DataTypes.ENUM('pending', 'running', 'success', 'failed'),
            allowNull: false,
            defaultValue: 'pending',
            field: 'last_status',
            comment: 'Status of the last run'
        },
        lastErrorMessage: {
            type: DataTypes.TEXT,
            allowNull: true,
            field: 'last_error_message',
            comment: 'Error message if the last run failed'
        },
        lastSuccessAt: {
            type: DataTypes.DATE,
            allowNull: true,
            field: 'last_success_at',
            comment: 'Timestamp of the last successful execution'
        },
        totalRuns: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
            field: 'total_runs',
            comment: 'Total number of times the job has run'
        },
        totalSuccessfulRuns: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
            field: 'total_successful_runs',
            comment: 'Number of successful runs'
        },
        totalFailedRuns: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
            field: 'total_failed_runs',
            comment: 'Number of failed runs'
        },
        averageExecutionTime: {
            type: DataTypes.INTEGER,
            allowNull: true,
            field: 'average_execution_time',
            comment: 'Average execution time in milliseconds'
        },
        jobHandler: {
            type: DataTypes.STRING,
            allowNull: false,
            field: 'job_handler',
            comment: 'Path to the job handler file (e.g., jobs/subscriptionReminder)'
        },
        metadata: {
            type: DataTypes.JSON,
            allowNull: true,
            field: 'metadata',
            comment: 'Additional configuration or parameters for the job'
        }
    }, {
        tableName: 'jobs',
        timestamps: true,
        underscored: true,
        indexes: [
            {
                fields: ['name']
            },
            {
                fields: ['is_active']
            },
            {
                fields: ['last_status']
            },
            {
                fields: ['next_run_at']
            }
        ]
    });

    return Job;
};
