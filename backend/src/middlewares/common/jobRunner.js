const { runJobNow, rescheduleJob } = require('../../jobs');

/**
 * Middleware to attach job runner functions to the request object
 * This allows controllers to access and run jobs
 */
function jobRunnerMiddleware(req, res, next) {
    try {
        req.jobRunner = {
            runJobNow: (jobName, models) => runJobNow(jobName, models),
            rescheduleJob: (jobId, cronExpression, models) => rescheduleJob(jobId, cronExpression, models)
        };
        next();
    } catch (error) {
        console.error('Job runner middleware error:', error.message);
        next();
    }
}

module.exports = jobRunnerMiddleware;
