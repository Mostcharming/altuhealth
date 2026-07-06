'use strict';

const { Op } = require('sequelize');
const notify = require('../utils/notify');

/**
 * Retail Subscription Expiry Reminder Job
 * Sends reminders to retail enrollees about subscriptions expiring soon (7 days before)
 */
async function retailSubscriptionReminderJob(models) {
    try {
        const { RetailEnrolleeSubscription, RetailEnrollee, Plan, Job } = models;

        // Get job configuration
        const job = await Job.findOne({
            where: { name: 'SUBSCRIPTION_EXPIRY_REMINDER' }
        });

        if (!job || !job.isActive) {
            console.log('Retail subscription reminder job is not active');
            return;
        }

        // Update job status to running
        await job.update({ lastStatus: 'running' });

        const startTime = Date.now();
        const reminderDaysBefore = job.metadata?.reminderDaysBefore || 7;

        // Calculate date range: exactly reminderDaysBefore days from now
        const today = new Date();
        const expiryReminderDate = new Date();
        expiryReminderDate.setDate(expiryReminderDate.getDate() + reminderDaysBefore);

        // Start of the reminder date
        const startOfReminderDate = new Date(expiryReminderDate);
        startOfReminderDate.setHours(0, 0, 0, 0);

        // End of the reminder date
        const endOfReminderDate = new Date(expiryReminderDate);
        endOfReminderDate.setHours(23, 59, 59, 999);

        // Find retail subscriptions expiring in exactly reminderDaysBefore days
        const expiringSubscriptions = await RetailEnrolleeSubscription.findAll({
            where: {
                status: 'active',
                subscriptionEndDate: {
                    [Op.gte]: startOfReminderDate,
                    [Op.lte]: endOfReminderDate
                }
            },
            include: [
                {
                    model: RetailEnrollee,
                    attributes: ['id', 'firstName', 'email', 'policyNumber'],
                    required: true
                },
                {
                    model: Plan,
                    attributes: ['id', 'name'],
                    required: true
                }
            ]
        });

        console.log(`Found ${expiringSubscriptions.length} retail subscriptions expiring in ${reminderDaysBefore} days`);

        let successCount = 0;
        let failureCount = 0;

        // Send notifications for each expiring subscription
        for (const subscription of expiringSubscriptions) {
            try {
                const enrollee = subscription.RetailEnrollee;
                const plan = subscription.Plan;

                // Skip if email is not available
                if (!enrollee.email) {
                    console.log(`No email for retail enrollee ${enrollee.id}, skipping notification`);
                    failureCount++;
                    continue;
                }

                const notificationPayload = {
                    name: enrollee.firstName,
                    policyNumber: enrollee.policyNumber || subscription.referenceNumber,
                    planName: plan.name,
                    expiryDate: subscription.subscriptionEndDate.toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                    }),
                    daysUntilExpiry: reminderDaysBefore,
                    dashboardLink: 'https://enrollee.altuhealth.com/dashboard/subscriptions'
                };

                // Send notification to enrollee email
                await notify(
                    {
                        id: enrollee.id,
                        email: enrollee.email,
                        firstName: enrollee.firstName
                    },
                    'enrollee',
                    'SUBSCRIPTION_EXPIRY_REMINDER',
                    notificationPayload
                );

                successCount++;
                console.log(`Sent reminder for retail subscription ${subscription.referenceNumber} to ${enrollee.email}`);
            } catch (err) {
                failureCount++;
                console.error(
                    `Failed to send reminder for retail subscription ${subscription.referenceNumber}:`,
                    err.message
                );
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

        const message = `Retail subscription reminder job completed. Sent ${successCount} reminders, ${failureCount} failed. Execution time: ${executionTime}ms`;
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
        console.error('Retail subscription reminder job failed:', err);

        try {
            const { Job } = models;
            const job = await Job.findOne({
                where: { name: 'SUBSCRIPTION_EXPIRY_REMINDER' }
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

module.exports = retailSubscriptionReminderJob;
