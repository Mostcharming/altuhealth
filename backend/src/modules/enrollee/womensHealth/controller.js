'use strict';

const { Op } = require('sequelize');

/**
 * Get or create period tracker for the current enrollee
 */
async function getPeriodTracker(req, res, next) {
    try {
        const { PeriodTracker } = req.models;
        const enrolleeId = req.user?.id;

        if (!enrolleeId) return res.fail('Enrollee ID is required', 400);

        let tracker = await PeriodTracker.findOne({
            where: { enrolleeId }
        });

        if (!tracker) {
            return res.success(null, 'No period tracker found. Please create one.', 200);
        }

        return res.success(tracker, 'Period tracker retrieved successfully', 200);
    } catch (err) {
        console.error('Error retrieving period tracker:', err);
        return res.fail(err.message, 500);
    }
}

/**
 * Create a new period tracker for the current enrollee
 */
async function createPeriodTracker(req, res, next) {
    try {
        const { PeriodTracker } = req.models;
        const enrolleeId = req.user?.id;

        if (!enrolleeId) return res.fail('Enrollee ID is required', 400);

        // Check if tracker already exists
        let existingTracker = await PeriodTracker.findOne({
            where: { enrolleeId }
        });

        if (existingTracker) {
            return res.fail('Period tracker already exists for this enrollee', 409);
        }

        const {
            lastPeriodDate,
            cycleLength = 28,
            periodDuration = 5,
            notes
        } = req.body;

        if (!lastPeriodDate) {
            return res.fail('`lastPeriodDate` is required', 400);
        }

        // Calculate predictions
        const predictions = calculatePeriodPredictions(
            new Date(lastPeriodDate),
            cycleLength,
            periodDuration
        );

        const tracker = await PeriodTracker.create({
            enrolleeId,
            lastPeriodDate: new Date(lastPeriodDate),
            cycleLength,
            periodDuration,
            nextPeriodDate: predictions.nextPeriodDate,
            nextFertileWindowStart: predictions.nextFertileWindowStart,
            nextFertileWindowEnd: predictions.nextFertileWindowEnd,
            notes,
            isActive: true
        });

        return res.success(tracker, 'Period tracker created successfully', 201);
    } catch (err) {
        console.error('Error creating period tracker:', err);
        return res.fail(err.message, 500);
    }
}

/**
 * Update period tracker with new period date
 */
async function updatePeriodTracker(req, res, next) {
    try {
        const { PeriodTracker } = req.models;
        const enrolleeId = req.user?.id;

        if (!enrolleeId) return res.fail('Enrollee ID is required', 400);

        const {
            lastPeriodDate,
            cycleLength,
            periodDuration,
            notes
        } = req.body;

        let tracker = await PeriodTracker.findOne({
            where: { enrolleeId }
        });

        if (!tracker) {
            return res.fail('Period tracker not found', 404);
        }

        // Update with provided values or keep existing ones
        const updatedLastPeriodDate = lastPeriodDate ? new Date(lastPeriodDate) : tracker.lastPeriodDate;
        const updatedCycleLength = cycleLength || tracker.cycleLength;
        const updatedPeriodDuration = periodDuration || tracker.periodDuration;

        // Recalculate predictions
        const predictions = calculatePeriodPredictions(
            updatedLastPeriodDate,
            updatedCycleLength,
            updatedPeriodDuration
        );

        await tracker.update({
            lastPeriodDate: updatedLastPeriodDate,
            cycleLength: updatedCycleLength,
            periodDuration: updatedPeriodDuration,
            nextPeriodDate: predictions.nextPeriodDate,
            nextFertileWindowStart: predictions.nextFertileWindowStart,
            nextFertileWindowEnd: predictions.nextFertileWindowEnd,
            notes: notes !== undefined ? notes : tracker.notes
        });

        return res.success(tracker, 'Period tracker updated successfully', 200);
    } catch (err) {
        console.error('Error updating period tracker:', err);
        return res.fail(err.message, 500);
    }
}

/**
 * Get period tracking calendar events (events for display on calendar)
 */
async function getPeriodEvents(req, res, next) {
    try {
        const { PeriodTracker } = req.models;
        const enrolleeId = req.user?.id;

        if (!enrolleeId) return res.fail('Enrollee ID is required', 400);

        const tracker = await PeriodTracker.findOne({
            where: { enrolleeId }
        });

        if (!tracker) {
            return res.success([], 'No period tracker found', 200);
        }

        // Generate events for the next 6 months
        const events = generatePeriodEvents(tracker, 6);

        return res.success(events, 'Period events retrieved successfully', 200);
    } catch (err) {
        console.error('Error retrieving period events:', err);
        return res.fail(err.message, 500);
    }
}

/**
 * Calculate period predictions
 */
function calculatePeriodPredictions(lastPeriodDate, cycleLength, periodDuration) {
    const startDate = new Date(lastPeriodDate);

    // Calculate next period date
    const nextPeriodDate = new Date(startDate);
    nextPeriodDate.setDate(nextPeriodDate.getDate() + cycleLength);

    // Calculate fertile window (5 days before ovulation + ovulation day)
    const ovulationDay = Math.round(cycleLength / 2);
    const fertileWindowStart = new Date(startDate);
    fertileWindowStart.setDate(fertileWindowStart.getDate() + (ovulationDay - 5));

    const fertileWindowEnd = new Date(startDate);
    fertileWindowEnd.setDate(fertileWindowEnd.getDate() + (ovulationDay + 1));

    return {
        nextPeriodDate,
        nextFertileWindowStart: fertileWindowStart,
        nextFertileWindowEnd: fertileWindowEnd
    };
}

/**
 * Generate calendar events for period tracking
 */
function generatePeriodEvents(tracker, monthsAhead = 6) {
    const events = [];
    const today = new Date();
    const lastPeriod = new Date(tracker.lastPeriodDate);

    // Generate events for each future cycle
    for (let i = 0; i < monthsAhead; i++) {
        const cycleStartDate = new Date(lastPeriod);
        cycleStartDate.setDate(cycleStartDate.getDate() + (tracker.cycleLength * i));

        // Skip if date is in the past
        if (cycleStartDate < today) continue;

        // Period event (starts on cycle start date, lasts for periodDuration days)
        const periodEndDate = new Date(cycleStartDate);
        periodEndDate.setDate(periodEndDate.getDate() + tracker.periodDuration);

        events.push({
            id: `period-${i}`,
            title: 'Period',
            start: cycleStartDate.toISOString().split('T')[0],
            end: periodEndDate.toISOString().split('T')[0],
            extendedProps: {
                calendar: 'danger',
                type: 'period'
            },
            display: 'background',
            backgroundColor: '#ef4444',
            borderColor: '#dc2626'
        });

        // Fertile window event (5 days before ovulation + ovulation day + 1)
        const ovulationDay = Math.round(tracker.cycleLength / 2);
        const fertileStart = new Date(cycleStartDate);
        fertileStart.setDate(fertileStart.getDate() + (ovulationDay - 5));

        const fertileEnd = new Date(cycleStartDate);
        fertileEnd.setDate(fertileEnd.getDate() + (ovulationDay + 1));

        events.push({
            id: `fertile-${i}`,
            title: 'Fertile Window',
            start: fertileStart.toISOString().split('T')[0],
            end: fertileEnd.toISOString().split('T')[0],
            extendedProps: {
                calendar: 'success',
                type: 'fertile'
            },
            display: 'background',
            backgroundColor: '#10b981',
            borderColor: '#059669'
        });

        // Ovulation event (single day)
        const ovulationDate = new Date(cycleStartDate);
        ovulationDate.setDate(ovulationDate.getDate() + ovulationDay);

        events.push({
            id: `ovulation-${i}`,
            title: 'Ovulation',
            start: ovulationDate.toISOString().split('T')[0],
            extendedProps: {
                calendar: 'primary',
                type: 'ovulation'
            }
        });
    }

    return events;
}

module.exports = {
    getPeriodTracker,
    createPeriodTracker,
    updatePeriodTracker,
    getPeriodEvents
};
