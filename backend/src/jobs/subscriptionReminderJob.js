'use strict';

const { Op } = require('sequelize');
const notify = require('../utils/notify');

/**
 * Subscription Expiry Reminder Job
 * Sends reminders to companies about subscriptions expiring soon
 */
async function subscriptionReminderJob(models) {
    try {
        const { Subscription, Company, Job } = models;

        // Get job configuration
        const job = await Job.findOne({
            where: { name: 'COMPANY_SUBSCRIPTION_EXPIRY_REMINDER' }
        });

        if (!job || !job.isActive) {
            console.log('Subscription reminder job is not active');
            return;
        }

        // Update job status to running
        await job.update({ lastStatus: 'running' });

        const startTime = Date.now();
        const reminderDaysBefore = job.metadata?.reminderDaysBefore || 7;

        // Calculate date range: today + X days before expiry
        const today = new Date();
        const expiryReminderDate = new Date();
        expiryReminderDate.setDate(expiryReminderDate.getDate() + reminderDaysBefore);

        // Find subscriptions expiring soon
        const expiringSubscriptions = await Subscription.findAll({
            where: {
                status: 'active',
                endDate: {
                    [Op.lte]: expiryReminderDate,
                    [Op.gte]: today
                }
            },
            include: [
                {
                    model: Company,
                    attributes: ['id', 'name', 'email'],
                    required: true
                }
            ]
        });

        console.log(`Found ${expiringSubscriptions.length} subscriptions expiring soon`);

        let successCount = 0;
        let failureCount = 0;

        // Send notifications for each expiring subscription
        for (const subscription of expiringSubscriptions) {
            try {
                const company = subscription.Company;
                const daysUntilExpiry = Math.ceil(
                    (subscription.endDate - today) / (1000 * 60 * 60 * 24)
                );

                const notificationPayload = {
                    name: company.name,
                    policyNumber: subscription.code,
                    planName: subscription.code,
                    expiryDate: subscription.endDate.toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                    }),
                    daysUntilExpiry,
                    dashboardLink: 'https://enrollee.altuhealth.com/'
                };

                // Send notification to company email
                await notify(
                    {
                        id: company.id,
                        email: company.email,
                        firstName: company.name
                    },
                    'company',
                    'COMPANY_SUBSCRIPTION_EXPIRY_REMINDER',
                    notificationPayload
                );

                successCount++;
                console.log(`Sent reminder for subscription ${subscription.code} to ${company.email}`);
            } catch (err) {
                failureCount++;
                console.error(`Failed to send reminder for subscription ${subscription.code}:`, err.message);
            }
        }

        // Calculate execution time
        const executionTime = Date.now() - startTime;
        const newAverageTime = job.averageExecutionTime
            ? Math.round(
                (job.averageExecutionTime * job.totalSuccessfulRuns + executionTime) /
                (job.totalSuccessfulRuns + 1)
            )
            : executionTime;

        // Update job with success status
        await job.update({
            lastStatus: 'success',
            lastRunAt: new Date(),
            lastSuccessAt: new Date(),
            totalRuns: job.totalRuns + 1,
            totalSuccessfulRuns: job.totalSuccessfulRuns + 1,
            averageExecutionTime: newAverageTime,
            lastErrorMessage: null
        });

        const message = `Subscription reminder job completed. Sent ${successCount} reminders, ${failureCount} failed. Execution time: ${executionTime}ms`;
        console.log(message);

        return {
            success: true,
            totalSubscriptions: expiringSubscriptions.length,
            successCount,
            failureCount,
            executionTime,
            message
        };
    } catch (err) {
        console.error('Subscription reminder job failed:', err);

        try {
            const { Job } = models;
            const job = await Job.findOne({
                where: { name: 'COMPANY_SUBSCRIPTION_EXPIRY_REMINDER' }
            });

            if (job) {
                await job.update({
                    lastStatus: 'failed',
                    lastRunAt: new Date(),
                    totalRuns: job.totalRuns + 1,
                    totalFailedRuns: job.totalFailedRuns + 1,
                    lastErrorMessage: err.message
                });
            }
        } catch (updateErr) {
            console.error('Failed to update job status:', updateErr);
        }

        throw err;
    }
}

module.exports = subscriptionReminderJob;
