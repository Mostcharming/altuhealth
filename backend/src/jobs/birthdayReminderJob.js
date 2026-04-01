'use strict';

const { Op } = require('sequelize');
const notify = require('../utils/notify');

/**
 * Birthday Reminder Job
 * Sends birthday reminders to enrollees and dependents
 * Handles:
 * - Company Enrollees (Enrollee)
 * - Company Enrollee Dependents (EnrolleeDependent)
 * - Retail Enrollees (RetailEnrollee)
 * - Retail Enrollee Dependents (RetailEnrolleeDependent)
 */
async function birthdayReminderJob(models) {
    try {
        const {
            Enrollee,
            EnrolleeDependent,
            RetailEnrollee,
            RetailEnrolleeDependent,
            Job
        } = models;

        // Get job configuration
        const job = await Job.findOne({
            where: { name: 'ENROLLEE_BIRTHDAY_REMINDER' }
        });

        if (!job || !job.isActive) {
            console.log('Birthday reminder job is not active');
            return;
        }

        // Update job status to running
        await job.update({ lastStatus: 'running' });

        const startTime = Date.now();

        // Get today's date
        const today = new Date();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');

        console.log(`Running birthday reminder job for ${month}-${day}`);

        let totalBirthdayCount = 0;
        let successCount = 0;
        let failureCount = 0;

        // 1. Find Company Enrollees with birthdays today
        try {
            const enrolleesWithBirthday = await Enrollee.findAll({
                attributes: ['id', 'firstName', 'email', 'dateOfBirth', 'policyNumber'],
                where: {
                    isActive: true,
                    [Op.sequelize.where(
                        Op.sequelize.fn('DATE_PART', 'month', Op.sequelize.col('date_of_birth')),
                        Op.eq,
                        today.getMonth() + 1
                    )]: true,
                    [Op.sequelize.where(
                        Op.sequelize.fn('DATE_PART', 'day', Op.sequelize.col('date_of_birth')),
                        Op.eq,
                        today.getDate()
                    )]: true
                }
            });

            totalBirthdayCount += enrolleesWithBirthday.length;
            console.log(`Found ${enrolleesWithBirthday.length} company enrollees with birthdays today`);

            for (const enrollee of enrolleesWithBirthday) {
                try {
                    if (!enrollee.email) {
                        console.log(`Skipping enrollee ${enrollee.id} - no email`);
                        continue;
                    }

                    const notificationPayload = {
                        name: enrollee.firstName,
                        dashboardLink: 'https://enrollee.altuhealth.com/'
                    };

                    // Send notification to enrollee email
                    await notify(
                        {
                            id: enrollee.id,
                            email: enrollee.email,
                            firstName: enrollee.firstName
                        },
                        'enrollee',
                        'BIRTHDAY_REMINDER',
                        notificationPayload
                    );

                    successCount++;
                    console.log(`Sent birthday reminder to enrollee ${enrollee.policyNumber} (${enrollee.email})`);
                } catch (err) {
                    failureCount++;
                    console.error(`Failed to send birthday reminder to enrollee ${enrollee.id}:`, err.message);
                }
            }
        } catch (err) {
            console.error('Error processing company enrollees:', err.message);
        }

        // 2. Find Company Enrollee Dependents with birthdays today
        try {
            const dependentsWithBirthday = await EnrolleeDependent.findAll({
                attributes: ['id', 'firstName', 'email', 'dateOfBirth', 'policyNumber', 'enrolleeId'],
                where: {
                    isActive: true,
                    [Op.sequelize.where(
                        Op.sequelize.fn('DATE_PART', 'month', Op.sequelize.col('date_of_birth')),
                        Op.eq,
                        today.getMonth() + 1
                    )]: true,
                    [Op.sequelize.where(
                        Op.sequelize.fn('DATE_PART', 'day', Op.sequelize.col('date_of_birth')),
                        Op.eq,
                        today.getDate()
                    )]: true
                }
            });

            totalBirthdayCount += dependentsWithBirthday.length;
            console.log(`Found ${dependentsWithBirthday.length} company enrollee dependents with birthdays today`);

            for (const dependent of dependentsWithBirthday) {
                try {
                    if (!dependent.email) {
                        console.log(`Skipping dependent ${dependent.id} - no email`);
                        continue;
                    }

                    const notificationPayload = {
                        name: dependent.firstName,
                        dashboardLink: 'https://enrollee.altuhealth.com/'
                    };

                    // Send notification to dependent email
                    await notify(
                        {
                            id: dependent.id,
                            email: dependent.email,
                            firstName: dependent.firstName
                        },
                        'enrollee_dependent',
                        'BIRTHDAY_REMINDER',
                        notificationPayload
                    );

                    successCount++;
                    console.log(`Sent birthday reminder to enrollee dependent ${dependent.policyNumber} (${dependent.email})`);
                } catch (err) {
                    failureCount++;
                    console.error(`Failed to send birthday reminder to dependent ${dependent.id}:`, err.message);
                }
            }
        } catch (err) {
            console.error('Error processing company enrollee dependents:', err.message);
        }

        // 3. Find Retail Enrollees with birthdays today
        try {
            const retailEnrolleesWithBirthday = await RetailEnrollee.findAll({
                attributes: ['id', 'firstName', 'email', 'dateOfBirth', 'policyNumber'],
                where: {
                    isActive: true,
                    [Op.sequelize.where(
                        Op.sequelize.fn('DATE_PART', 'month', Op.sequelize.col('date_of_birth')),
                        Op.eq,
                        today.getMonth() + 1
                    )]: true,
                    [Op.sequelize.where(
                        Op.sequelize.fn('DATE_PART', 'day', Op.sequelize.col('date_of_birth')),
                        Op.eq,
                        today.getDate()
                    )]: true
                }
            });

            totalBirthdayCount += retailEnrolleesWithBirthday.length;
            console.log(`Found ${retailEnrolleesWithBirthday.length} retail enrollees with birthdays today`);

            for (const enrollee of retailEnrolleesWithBirthday) {
                try {
                    if (!enrollee.email) {
                        console.log(`Skipping retail enrollee ${enrollee.id} - no email`);
                        continue;
                    }

                    const notificationPayload = {
                        name: enrollee.firstName,
                        dashboardLink: 'https://enrollee.altuhealth.com/'
                    };

                    // Send notification to retail enrollee email
                    await notify(
                        {
                            id: enrollee.id,
                            email: enrollee.email,
                            firstName: enrollee.firstName
                        },
                        'retail_enrollee',
                        'BIRTHDAY_REMINDER',
                        notificationPayload
                    );

                    successCount++;
                    console.log(`Sent birthday reminder to retail enrollee ${enrollee.policyNumber} (${enrollee.email})`);
                } catch (err) {
                    failureCount++;
                    console.error(`Failed to send birthday reminder to retail enrollee ${enrollee.id}:`, err.message);
                }
            }
        } catch (err) {
            console.error('Error processing retail enrollees:', err.message);
        }

        // 4. Find Retail Enrollee Dependents with birthdays today
        try {
            const retailDependentsWithBirthday = await RetailEnrolleeDependent.findAll({
                attributes: ['id', 'firstName', 'email', 'dateOfBirth', 'policyNumber', 'retailEnrolleeId'],
                where: {
                    isActive: true,
                    [Op.sequelize.where(
                        Op.sequelize.fn('DATE_PART', 'month', Op.sequelize.col('date_of_birth')),
                        Op.eq,
                        today.getMonth() + 1
                    )]: true,
                    [Op.sequelize.where(
                        Op.sequelize.fn('DATE_PART', 'day', Op.sequelize.col('date_of_birth')),
                        Op.eq,
                        today.getDate()
                    )]: true
                }
            });

            totalBirthdayCount += retailDependentsWithBirthday.length;
            console.log(`Found ${retailDependentsWithBirthday.length} retail enrollee dependents with birthdays today`);

            for (const dependent of retailDependentsWithBirthday) {
                try {
                    if (!dependent.email) {
                        console.log(`Skipping retail dependent ${dependent.id} - no email`);
                        continue;
                    }

                    const notificationPayload = {
                        name: dependent.firstName,
                        dashboardLink: 'https://enrollee.altuhealth.com/'
                    };

                    // Send notification to retail dependent email
                    await notify(
                        {
                            id: dependent.id,
                            email: dependent.email,
                            firstName: dependent.firstName
                        },
                        'retail_enrollee_dependent',
                        'BIRTHDAY_REMINDER',
                        notificationPayload
                    );

                    successCount++;
                    console.log(`Sent birthday reminder to retail dependent ${dependent.policyNumber} (${dependent.email})`);
                } catch (err) {
                    failureCount++;
                    console.error(`Failed to send birthday reminder to retail dependent ${dependent.id}:`, err.message);
                }
            }
        } catch (err) {
            console.error('Error processing retail enrollee dependents:', err.message);
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

        const message = `Birthday reminder job completed. Found ${totalBirthdayCount} birthdays, sent ${successCount} reminders, ${failureCount} failed. Execution time: ${executionTime}ms`;
        console.log(message);

        return {
            success: true,
            totalBirthdaysFound: totalBirthdayCount,
            successCount,
            failureCount,
            executionTime,
            message
        };
    } catch (err) {
        console.error('Birthday reminder job failed:', err);

        try {
            const { Job } = models;
            const job = await Job.findOne({
                where: { name: 'ENROLLEE_BIRTHDAY_REMINDER' }
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

module.exports = birthdayReminderJob;
