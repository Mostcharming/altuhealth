'use strict';

const { archiveExpiredRequests } = require('../services/accountDeletionService');

async function accountDeletionRetentionJob(models) {
    const { Job } = models;
    const job = await Job.findOne({ where: { name: 'ACCOUNT_DELETION_RETENTION' } });
    if (!job || !job.isActive) return { success: true, archivedCount: 0, skipped: true };

    const startedAt = Date.now();
    await job.update({ lastStatus: 'running', lastRunAt: new Date() });

    try {
        const archivedCount = await archiveExpiredRequests(models);
        const executionTime = Date.now() - startedAt;
        const previousSuccesses = job.totalSuccessfulRuns || 0;
        const averageExecutionTime = job.averageExecutionTime
            ? Math.round(((job.averageExecutionTime * previousSuccesses) + executionTime) / (previousSuccesses + 1))
            : executionTime;

        await job.update({
            lastStatus: 'success',
            lastSuccessAt: new Date(),
            lastErrorMessage: null,
            totalRuns: (job.totalRuns || 0) + 1,
            totalSuccessfulRuns: previousSuccesses + 1,
            averageExecutionTime,
            metadata: { ...(job.metadata || {}), retentionDays: 60, lastArchivedCount: archivedCount }
        });

        return { success: true, archivedCount };
    } catch (error) {
        await job.update({
            lastStatus: 'failed',
            lastErrorMessage: error.message,
            totalRuns: (job.totalRuns || 0) + 1,
            totalFailedRuns: (job.totalFailedRuns || 0) + 1
        });
        throw error;
    }
}

module.exports = accountDeletionRetentionJob;
