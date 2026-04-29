const { Enrollee, Appointment, Benefit, CompanyPlanBenefit } = require('../../../database/models');

/**
 * Get dashboard data for enrollee
 * Returns metrics, statistics, health plan, benefits, and appointments
 */
exports.getDashboardData = async (req, res, next) => {
    try {
        const enrolleeId = req.user?.id;

        if (!enrolleeId) {
            return res.status(401).json({
                success: false,
                message: 'Unauthorized access',
            });
        }

        // Fetch enrollee data
        const enrollee = await Enrollee.findByPk(enrolleeId, {
            attributes: ['id', 'firstName', 'lastName', 'planId', 'enrollmentDate', 'status'],
        });

        if (!enrollee) {
            return res.status(404).json({
                success: false,
                message: 'Enrollee not found',
            });
        }

        // Calculate days until renewal (assuming 1-year renewal)
        const enrollmentDate = new Date(enrollee.enrollmentDate);
        const renewalDate = new Date(enrollmentDate.getFullYear() + 1, enrollmentDate.getMonth(), enrollmentDate.getDate());
        const today = new Date();
        const daysUntilRenewal = Math.max(0, Math.ceil((renewalDate - today) / (1000 * 60 * 60 * 24)));

        // Fetch appointments
        const appointments = await Appointment.findAll({
            where: { enrolleeId },
            attributes: ['id', 'title', 'appointmentDate', 'appointmentTime', 'doctorName'],
            order: [['appointmentDate', 'ASC']],
            limit: 5,
        });

        // Fetch benefits data
        const benefits = await CompanyPlanBenefit.findAll({
            where: { companyPlanId: enrollee.planId },
            attributes: ['id', 'limitAmount', 'usedAmount'],
            limit: 10,
        });

        // Calculate benefits statistics
        const totalAvailable = benefits.reduce((sum, b) => sum + (b.limitAmount || 0), 0);
        const totalUsed = benefits.reduce((sum, b) => sum + (b.usedAmount || 0), 0);
        const totalRemaining = Math.max(0, totalAvailable - totalUsed);

        const availablePercentage = totalAvailable > 0 ? Math.round((totalAvailable / (totalAvailable + totalRemaining)) * 100) : 0;
        const usedPercentage = totalAvailable > 0 ? Math.round((totalUsed / totalAvailable) * 100) : 0;
        const remainingPercentage = 100 - usedPercentage;

        // Build response data
        const dashboardData = {
            metrics: [
                {
                    id: 1,
                    title: 'Medical Visits',
                    value: '0',
                    change: '+0%',
                    direction: 'up',
                    comparisonText: 'this month',
                },
                {
                    id: 2,
                    title: 'Medications Used',
                    value: '0',
                    change: '+0%',
                    direction: 'up',
                    comparisonText: 'this month',
                },
                {
                    id: 3,
                    title: 'Healthcare Services',
                    value: '0',
                    change: '+0%',
                    direction: 'up',
                    comparisonText: 'this month',
                },
            ],
            statisticsChart: {
                medicationsClaimed: 8,
                medicationsPercentage: 65,
                visitsCompleted: 3,
                visitsPercentage: 60,
                monthlyData: {
                    medications: [2, 3, 2, 1, 4, 2, 1, 3, 2, 4, 3, 2],
                    visits: [1, 1, 2, 1, 1, 1, 0, 1, 1, 2, 1, 1],
                },
            },
            healthPlan: {
                daysUntilRenewal,
                status: enrollee.status || 'Active',
            },
            benefits: {
                availablePercentage,
                usedPercentage,
                remainingPercentage,
                totalBenefits: totalAvailable.toLocaleString(),
            },
            appointments: appointments.map((apt) => ({
                id: apt.id,
                title: apt.title,
                date: apt.appointmentDate,
                time: apt.appointmentTime,
                doctor: apt.doctorName,
            })),
        };

        return res.status(200).json({
            success: true,
            data: dashboardData,
        });
    } catch (error) {
        next(error);
    }
};
