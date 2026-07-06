'use strict';

const { Op } = require('sequelize');

/**
 * Period Prediction Job
 * Calculates and updates next period dates and fertile windows for all active trackers
 * Runs daily at midnight to ensure predictions are always current
 */
async function periodPredictionJob(models) {
    try {
        const { PeriodTracker, Enrollee, Job } = models;

        // Get job configuration
        const job = await Job.findOne({
            where: { name: 'WOMEN_HEALTH_PERIOD_PREDICTION' }
        });

        if (!job || !job.isActive) {
            console.log('Period prediction job is not active');
            return;
        }

        // Update job status to running
        await job.update({ lastStatus: 'running' });

        const startTime = Date.now();
        let updatedCount = 0;

        // Find all active period trackers
        const trackers = await PeriodTracker.findAll({
            where: { isActive: true },
            include: [
                {
                    model: Enrollee,
                    attributes: ['id', 'firstName', 'lastName', 'email'],
                    required: true
                }
            ]
        });

        console.log(`Processing ${trackers.length} active period trackers`);

        // Calculate predictions for each tracker
        for (const tracker of trackers) {
            try {
                const predictions = calculatePeriodPredictions(
                    tracker.lastPeriodDate,
                    tracker.cycleLength,
                    tracker.periodDuration
                );

                // Update tracker with new predictions
                await tracker.update({
                    nextPeriodDate: predictions.nextPeriodDate,
                    nextFertileWindowStart: predictions.nextFertileWindowStart,
                    nextFertileWindowEnd: predictions.nextFertileWindowEnd
                });

                updatedCount++;
            } catch (err) {
                console.error(`Error updating predictions for tracker ${tracker.id}:`, err);
            }
        }

        const endTime = Date.now();
        const duration = endTime - startTime;

        // Update job status to completed
        await job.update({
            lastStatus: 'completed',
            lastRun: new Date(),
            metadata: {
                ...job.metadata,
                lastExecutionTime: duration,
                trackersProcessed: updatedCount
            }
        });

        console.log(`Period prediction job completed. Updated ${updatedCount} trackers in ${duration}ms`);
        return { success: true, updatedCount };

    } catch (err) {
        console.error('Period prediction job failed:', err);
        const { Job } = models;
        const job = await Job.findOne({ where: { name: 'WOMEN_HEALTH_PERIOD_PREDICTION' } });
        if (job) {
            await job.update({
                lastStatus: 'failed',
                lastError: err.message
            });
        }
        throw err;
    }
}

/**
 * Calculate period predictions based on cycle data
 * @param {Date} lastPeriodDate - The start date of the last period
 * @param {Number} cycleLength - Average cycle length in days
 * @param {Number} periodDuration - Average period duration in days
 * @returns {Object} Object containing next period date and fertile window dates
 */
function calculatePeriodPredictions(lastPeriodDate, cycleLength, periodDuration) {
    const startDate = new Date(lastPeriodDate);

    // Calculate next period date (add cycle length to last period date)
    const nextPeriodDate = new Date(startDate);
    nextPeriodDate.setDate(nextPeriodDate.getDate() + cycleLength);

    // Calculate fertile window
    // Typical fertile window is 5 days before ovulation and on ovulation day
    // Ovulation typically occurs around day 14 of a 28-day cycle
    const ovulationDay = Math.round(cycleLength / 2);
    const fertileWindowStart = new Date(startDate);
    fertileWindowStart.setDate(fertileWindowStart.getDate() + (ovulationDay - 5));

    const fertileWindowEnd = new Date(startDate);
    fertileWindowEnd.setDate(fertileWindowEnd.getDate() + (ovulationDay + 1));

    return {
        nextPeriodDate: new Date(nextPeriodDate.getTime()),
        nextFertileWindowStart: new Date(fertileWindowStart.getTime()),
        nextFertileWindowEnd: new Date(fertileWindowEnd.getTime())
    };
}

module.exports = periodPredictionJob;
