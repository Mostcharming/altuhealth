'use strict';

const { Op } = require('sequelize');

async function listJobs(req, res, next) {
    try {
        const { Job } = req.models;
        const { limit = 10, page = 1, q, isActive } = req.query;

        const isAll = String(limit).toLowerCase() === 'all';
        const limitNum = isAll ? 0 : Number(limit);
        const pageNum = isAll ? 1 : (Number(page) || 1);
        const offset = isAll ? 0 : (pageNum - 1) * limitNum;

        const where = {};

        if (isActive !== undefined && isActive !== '') {
            where.isActive = isActive === 'true';
        }

        if (q) {
            where[Op.or] = [
                { name: { [Op.iLike || Op.like]: `%${q}%` } },
                { description: { [Op.iLike || Op.like]: `%${q}%` } },
                { cronExpression: { [Op.iLike || Op.like]: `%${q}%` } }
            ];
        }

        const total = await Job.count({ where });

        const findOptions = {
            where,
            order: [['createdAt', 'DESC']],
            attributes: [
                'id',
                'name',
                'description',
                'cronExpression',
                'isActive',
                'lastStatus',
                'lastRunAt',
                'lastSuccessAt',
                'lastErrorMessage',
                'totalRuns',
                'totalSuccessfulRuns',
                'averageExecutionTime',
                'metadata',
                'createdAt',
                'updatedAt'
            ]
        };

        if (!isAll) {
            findOptions.limit = limitNum;
            findOptions.offset = Number(offset);
        }

        const jobs = await Job.findAll(findOptions);
        const data = jobs.map(job => job.toJSON());

        const hasPrevPage = !isAll && pageNum > 1;
        const hasNextPage = !isAll && (offset + jobs.length < total);
        const totalPages = isAll ? 1 : (limitNum > 0 ? Math.ceil(total / limitNum) : 1);

        return res.success({
            list: data,
            count: total,
            page: pageNum,
            limit: isAll ? 'all' : limitNum,
            totalPages,
            hasNextPage,
            hasPrevPage
        });
    } catch (err) {
        return next(err);
    }
}

async function getJob(req, res, next) {
    try {
        const { Job } = req.models;
        const { id } = req.params;

        const job = await Job.findByPk(id);
        if (!job) {
            return res.fail('Job not found', 404);
        }

        return res.success({ job: job.toJSON() });
    } catch (err) {
        return next(err);
    }
}

async function runJob(req, res, next) {
    try {
        const { Job } = req.models;
        const { id } = req.params;
        const { jobRunner } = req;

        const job = await Job.findByPk(id);
        if (!job) {
            return res.fail('Job not found', 404);
        }

        if (!job.isActive) {
            return res.fail('Job is not active', 400);
        }

        // Run job asynchronously
        jobRunner.runJobNow(job.name, req.models)
            .then(result => {
                console.log(`Job ${job.name} executed successfully`);
            })
            .catch(err => {
                console.error(`Job ${job.name} execution failed:`, err.message);
            });

        return res.success({
            message: `Job "${job.name}" has been queued for execution`,
            jobId: job.id,
            jobName: job.name
        });
    } catch (err) {
        return next(err);
    }
}

async function updateJob(req, res, next) {
    try {
        const { Job } = req.models;
        const { id } = req.params;
        const { isActive, cronExpression, metadata } = req.body;

        const job = await Job.findByPk(id);
        if (!job) {
            return res.fail('Job not found', 404);
        }

        const updateData = {};
        if (isActive !== undefined) updateData.isActive = isActive;
        if (cronExpression) updateData.cronExpression = cronExpression;
        if (metadata) updateData.metadata = metadata;

        await job.update(updateData);

        // If job scheduler is available, reschedule the job
        if (cronExpression && req.jobRunner) {
            try {
                await req.jobRunner.rescheduleJob(id, cronExpression, req.models);
            } catch (err) {
                console.error('Failed to reschedule job:', err.message);
            }
        }

        return res.success({
            message: 'Job updated successfully',
            job: job.toJSON()
        });
    } catch (err) {
        return next(err);
    }
}

module.exports = {
    listJobs,
    getJob,
    runJob,
    updateJob
};
