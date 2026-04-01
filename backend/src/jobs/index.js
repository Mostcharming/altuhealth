'use strict';

const cron = require('node-cron');
const subscriptionReminderJob = require('./subscriptionReminderJob');
const retailSubscriptionReminderJob = require('./retailSubscriptionReminderJob');
const birthdayReminderJob = require('./birthdayReminderJob');

// Map of job names to their handler functions
const JOB_HANDLERS = {
    'COMPANY_SUBSCRIPTION_EXPIRY_REMINDER': subscriptionReminderJob,
    'RETAIL_SUBSCRIPTION_EXPIRY_REMINDER': retailSubscriptionReminderJob,
    'ENROLLEE_BIRTHDAY_REMINDER': birthdayReminderJob,
    'ENROLLEE_DEPENDENT_BIRTHDAY_REMINDER': birthdayReminderJob,
    'RETAIL_ENROLLEE_BIRTHDAY_REMINDER': birthdayReminderJob,
    'RETAIL_ENROLLEE_DEPENDENT_BIRTHDAY_REMINDER': birthdayReminderJob
};

let scheduledJobs = {};

/**
 * Initialize all scheduled jobs
 * @param {Object} models - Sequelize models
 */
async function initializeJobs(models) {
    try {
        const { Job } = models;

        console.log('Initializing scheduled jobs...');

        // Fetch all active jobs from database
        const jobs = await Job.findAll({
            where: { isActive: true }
        });

        console.log(`Found ${jobs.length} active jobs to schedule`);

        for (const job of jobs) {
            try {
                scheduleJob(job, models);
            } catch (err) {
                console.error(`Failed to schedule job ${job.name}:`, err.message);
            }
        }

        console.log('Job initialization completed');
    } catch (err) {
        console.error('Failed to initialize jobs:', err);
        throw err;
    }
}

/**
 * Schedule a single job
 * @param {Object} jobRecord - Job record from database
 * @param {Object} models - Sequelize models
 */
function scheduleJob(jobRecord, models) {
    try {
        // Check if job handler exists
        if (!JOB_HANDLERS[jobRecord.name]) {
            console.warn(`No handler found for job: ${jobRecord.name}`);
            return;
        }

        // Check if job is already scheduled
        if (scheduledJobs[jobRecord.id]) {
            console.log(`Job ${jobRecord.name} is already scheduled, skipping...`);
            return;
        }

        const handler = JOB_HANDLERS[jobRecord.name];

        // Schedule the job with cron
        const task = cron.schedule(jobRecord.cronExpression, async () => {
            console.log(`[${new Date().toISOString()}] Running job: ${jobRecord.name}`);
            try {
                await handler(models);
            } catch (err) {
                console.error(`Job ${jobRecord.name} failed:`, err);
            }
        });

        // Store scheduled job reference
        scheduledJobs[jobRecord.id] = {
            name: jobRecord.name,
            task: task,
            cronExpression: jobRecord.cronExpression
        };

        console.log(`✓ Scheduled job: ${jobRecord.name} (${jobRecord.cronExpression})`);
    } catch (err) {
        console.error(`Error scheduling job ${jobRecord.name}:`, err);
        throw err;
    }
}

/**
 * Unschedule a job
 * @param {string} jobId - Job ID
 */
function unscheduleJob(jobId) {
    try {
        if (scheduledJobs[jobId]) {
            scheduledJobs[jobId].task.stop();
            delete scheduledJobs[jobId];
            console.log(`Unscheduled job: ${jobId}`);
        }
    } catch (err) {
        console.error(`Failed to unschedule job ${jobId}:`, err);
    }
}

/**
 * Get all scheduled jobs
 * @returns {Object} Scheduled jobs map
 */
function getScheduledJobs() {
    return scheduledJobs;
}

/**
 * Run a job immediately
 * @param {string} jobName - Job name
 * @param {Object} models - Sequelize models
 */
async function runJobNow(jobName, models) {
    try {
        const handler = JOB_HANDLERS[jobName];
        if (!handler) {
            throw new Error(`No handler found for job: ${jobName}`);
        }

        console.log(`Manually running job: ${jobName}`);
        const result = await handler(models);
        console.log(`Job ${jobName} completed:`, result);
        return result;
    } catch (err) {
        console.error(`Failed to run job ${jobName}:`, err);
        throw err;
    }
}

/**
 * Reschedule a job with new cron expression
 * @param {string} jobId - Job ID
 * @param {string} newCronExpression - New cron expression
 * @param {Object} models - Sequelize models
 */
async function rescheduleJob(jobId, newCronExpression, models) {
    try {
        const { Job } = models;

        // Unschedule existing job
        unscheduleJob(jobId);

        // Update job in database
        const job = await Job.findByPk(jobId);
        if (!job) {
            throw new Error(`Job ${jobId} not found`);
        }

        await job.update({ cronExpression: newCronExpression });

        // Reschedule job
        scheduleJob(job, models);

        console.log(`Rescheduled job ${job.name} with new cron expression: ${newCronExpression}`);
        return { success: true, jobId, newCronExpression };
    } catch (err) {
        console.error(`Failed to reschedule job ${jobId}:`, err);
        throw err;
    }
}

/**
 * Stop all scheduled jobs
 */
function stopAllJobs() {
    try {
        Object.values(scheduledJobs).forEach(job => {
            job.task.stop();
        });
        scheduledJobs = {};
        console.log('All scheduled jobs stopped');
    } catch (err) {
        console.error('Failed to stop all jobs:', err);
    }
}

module.exports = {
    initializeJobs,
    scheduleJob,
    unscheduleJob,
    getScheduledJobs,
    runJobNow,
    rescheduleJob,
    stopAllJobs
};
