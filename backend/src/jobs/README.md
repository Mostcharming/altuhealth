# Job Scheduler System

This document outlines the scheduled job system for AltuHealth using Node Cron.

## Overview

The job scheduler system allows you to:

- Schedule recurring tasks (daily, weekly, monthly, etc.)
- Track job execution history
- Monitor job performance
- Manage job status and configuration through the database

## Architecture

### Components

1. **Job Model** (`job.model.js`) - Database model for storing job configurations
2. **Job Handler Functions** - Individual job implementations
3. **Job Scheduler** (`jobs/index.js`) - Main orchestrator using node-cron
4. **Server Integration** (`server.js`) - Initializes jobs on startup

### Database Schema

The `jobs` table stores:

- `name` - Unique job identifier
- `description` - Human-readable description
- `frequency` - How often the job runs (hourly, daily, weekly, etc.)
- `cronExpression` - Cron schedule expression
- `isActive` - Enable/disable the job
- `lastRunAt` - Timestamp of last execution
- `nextRunAt` - Timestamp of next scheduled run
- `lastStatus` - Status of last run (pending, running, success, failed)
- `lastErrorMessage` - Error details if last run failed
- `totalRuns` - Total number of executions
- `totalSuccessfulRuns` - Number of successful executions
- `totalFailedRuns` - Number of failed executions
- `averageExecutionTime` - Average execution time in milliseconds
- `jobHandler` - Path to the job handler file
- `metadata` - JSON field for job-specific configuration

## Available Jobs

### 1. COMPANY_SUBSCRIPTION_EXPIRY_REMINDER

**Purpose:** Sends email reminders to companies about subscriptions expiring soon

**Schedule:** Daily at 9 AM (cron: `0 9 * * *`)

**Configuration:**

- `reminderDaysBefore`: 7 (sends reminder 7 days before expiry)
- `retryAttempts`: 3
- `batchSize`: 100

**Workflow:**

1. Fetches all active subscriptions expiring within X days
2. For each subscription:
   - Gets the associated company and email
   - Creates notification payload with:
     - Company name
     - Subscription code (policy number)
     - Expiry date
     - Days until expiry
     - Dashboard link
   - Sends notification using the notify utility
3. Updates job tracking metrics

**Handler:** `jobs/subscriptionReminderJob.js`

### 2. RETAIL_SUBSCRIPTION_EXPIRY_REMINDER

**Purpose:** Sends email reminders to retail enrollees about subscriptions expiring in 7 days

**Schedule:** Daily at 10 AM (cron: `0 10 * * *`)

**Configuration:**

- `reminderDaysBefore`: 7 (sends reminder exactly 7 days before expiry)
- `retryAttempts`: 3
- `batchSize`: 100

**Workflow:**

1. Calculates the date exactly 7 days from now
2. Finds retail subscriptions expiring on that specific date
3. For each subscription:
   - Gets the associated retail enrollee and email
   - Gets the plan name
   - Creates notification payload with:
     - Enrollee name
     - Policy number
     - Plan name
     - Expiry date
     - Dashboard link
   - Sends notification using the notify utility
4. Only sends to enrollees with valid email addresses
5. Updates job tracking metrics

**Handler:** `jobs/retailSubscriptionReminderJob.js`

## Cron Expression Format

Cron expressions in this system follow the standard format:

```
┌───────────── minute (0 - 59)
│ ┌───────────── hour (0 - 23)
│ │ ┌───────────── day of month (1 - 31)
│ │ │ ┌───────────── month (1 - 12)
│ │ │ │ ┌───────────── day of week (0 - 6) (Sunday to Saturday)
│ │ │ │ │
│ │ │ │ │
* * * * *
```

### Common Examples

- `0 9 * * *` - Every day at 9:00 AM
- `0 10 * * *` - Every day at 10:00 AM
- `0 */6 * * *` - Every 6 hours
- `0 0 * * 0` - Every Sunday at midnight
- `0 0 1 * *` - First day of every month at midnight
- `*/15 * * * *` - Every 15 minutes
- `0 9 * * 1-5` - Monday to Friday at 9:00 AM

## API Reference

### Initialize Jobs

```javascript
const { initializeJobs } = require("./jobs");
await initializeJobs(models);
```

Loads all active jobs from database and schedules them with cron.

### Run Job Immediately

```javascript
const { runJobNow } = require("./jobs");
const result = await runJobNow("COMPANY_SUBSCRIPTION_EXPIRY_REMINDER", models);
```

Execute a job outside its scheduled time.

### Reschedule Job

```javascript
const { rescheduleJob } = require("./jobs");
await rescheduleJob(jobId, "0 12 * * *", models); // Change to run at noon
```

### Get Scheduled Jobs

```javascript
const { getScheduledJobs } = require("./jobs");
const jobs = getScheduledJobs();
```

Returns a map of all currently scheduled jobs.

### Stop All Jobs

```javascript
const { stopAllJobs } = require("./jobs");
stopAllJobs();
```

Gracefully stops all scheduled jobs (called on server shutdown).

## Setup & Migration

### 1. Run Migrations

```bash
npm run migrate
```

This will:

- Create the `jobs` table
- Seed initial job configurations

### 2. Install Dependencies

```bash
npm install node-cron
```

### 3. Start Server

```bash
npm start
# or for development
npm run dev
```

The server will:

1. Initialize the database
2. Fetch all active jobs from the `jobs` table
3. Schedule each job with node-cron
4. Log initialization details to console

## Monitoring & Management

### Check Job Status

Query the jobs table:

```sql
SELECT name, last_status, last_run_at, last_success_at, total_runs, total_successful_runs FROM jobs;
```

### Enable/Disable a Job

```sql
UPDATE jobs SET is_active = false WHERE name = 'COMPANY_SUBSCRIPTION_EXPIRY_REMINDER';
```

Then restart the server for the change to take effect, or use the API to reschedule.

### Change Job Schedule

```sql
UPDATE jobs
SET cron_expression = '0 12 * * *'
WHERE name = 'COMPANY_SUBSCRIPTION_EXPIRY_REMINDER';
```

### Check Execution History

```sql
SELECT name, last_status, last_error_message, average_execution_time
FROM jobs
WHERE name = 'COMPANY_SUBSCRIPTION_EXPIRY_REMINDER';
```

## Notification Templates

Jobs use the following notification templates:

### SUBSCRIPTION_EXPIRY_REMINDER

- **For:** Companies and Retail Enrollees
- **Parameters:** name, policyNumber, planName, expiryDate, daysUntilExpiry, dashboardLink
- **Email:** Formatted HTML with personalized details
- **SMS:** Condensed version with essential information

## Best Practices

1. **Timezone Handling:**

   - Cron expressions use server timezone
   - Ensure server timezone is correctly configured
   - Store all dates in UTC in database

2. **Performance:**

   - Use batch processing for large datasets
   - Implement database indexes on frequently queried columns
   - Monitor average execution time

3. **Error Handling:**

   - Jobs track execution failures
   - Failed runs log error messages for debugging
   - Jobs continue even if individual notifications fail

4. **Testing:**

   - Use `runJobNow()` to test jobs manually
   - Check logs for execution details
   - Verify database updates after job runs

5. **Monitoring:**
   - Regularly check `lastStatus` and `lastErrorMessage`
   - Monitor `averageExecutionTime` for performance issues
   - Set up alerts for failed jobs

## Troubleshooting

### Jobs Not Running

1. Check if `isActive` is true in the jobs table
2. Verify cron expression is valid
3. Check server logs for initialization errors
4. Restart the server

### High Execution Time

1. Check database indexes
2. Verify notification service is responsive
3. Check for network issues
4. Reduce batch size if needed

### Missing Notifications

1. Verify contact information (email addresses) exist
2. Check notification service configuration
3. Review job logs for errors
4. Manually run job to test: `runJobNow('JOB_NAME', models)`

### Job Not Updating Database

1. Verify database connection
2. Check user permissions
3. Review error logs for SQL errors
4. Ensure Job model is properly defined

## Creating New Jobs

### 1. Create Job Handler

Create a new file in `jobs/` directory:

```javascript
// jobs/myNewJob.js
"use strict";

async function myNewJob(models) {
  try {
    const { Job } = models;

    const job = await Job.findOne({
      where: { name: "MY_NEW_JOB" },
    });

    if (!job || !job.isActive) {
      console.log("Job is not active");
      return;
    }

    await job.update({ lastStatus: "running" });
    const startTime = Date.now();

    // Job logic here

    const executionTime = Date.now() - startTime;
    await job.update({
      lastStatus: "success",
      lastRunAt: new Date(),
      lastSuccessAt: new Date(),
      totalRuns: job.totalRuns + 1,
      totalSuccessfulRuns: job.totalSuccessfulRuns + 1,
      averageExecutionTime: calculateAverage(
        job.averageExecutionTime,
        job.totalSuccessfulRuns,
        executionTime
      ),
      lastErrorMessage: null,
    });

    return { success: true, executionTime };
  } catch (err) {
    console.error("Job failed:", err);
    // Update with failure status
    throw err;
  }
}

module.exports = myNewJob;
```

### 2. Register in Job Handlers

Update `jobs/index.js`:

```javascript
const myNewJob = require("./myNewJob");

const JOB_HANDLERS = {
  COMPANY_SUBSCRIPTION_EXPIRY_REMINDER: subscriptionReminderJob,
  RETAIL_SUBSCRIPTION_EXPIRY_REMINDER: retailSubscriptionReminderJob,
  MY_NEW_JOB: myNewJob, // Add here
};
```

### 3. Create Migration

Create a new migration to insert job configuration:

```javascript
// migrations/20260401000000-add-my-new-job.js
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert(
      "jobs",
      [
        {
          id: uuidv4(),
          name: "MY_NEW_JOB",
          description: "Description of my job",
          frequency: "daily",
          cron_expression: "0 9 * * *",
          is_active: true,
          job_handler: "jobs/myNewJob",
          metadata: {
            /* config */
          },
          // ... other fields
        },
      ],
      {}
    );
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete("jobs", { name: "MY_NEW_JOB" }, {});
  },
};
```

### 4. Run Migration

```bash
npm run migrate
```

### 5. Restart Server

Server will automatically pick up and schedule the new job.

## License

Part of AltuHealth ERP System
