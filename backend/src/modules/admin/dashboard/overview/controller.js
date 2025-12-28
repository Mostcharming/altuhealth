const { Sequelize } = require('sequelize');

// Get companies and enrollees metrics
const getMetrics = async (req, res, next) => {
    try {
        const { Company, Enrollee, EnrolleeDependent } = req.models;
        // Get current month companies count
        const currentMonthCompanies = await Company.count({
            where: Sequelize.where(
                Sequelize.fn('EXTRACT', Sequelize.literal('MONTH FROM "created_at"')),
                Sequelize.Op.eq,
                new Date().getMonth() + 1
            ),
            raw: true,
        });

        // Get last month companies count
        const lastMonth = new Date().getMonth() === 0 ? 12 : new Date().getMonth();
        const lastMonthCompanies = await Company.count({
            where: Sequelize.where(
                Sequelize.fn('EXTRACT', Sequelize.literal('MONTH FROM "created_at"')),
                Sequelize.Op.eq,
                lastMonth
            ),
            raw: true,
        });

        // Calculate companies percentage
        const companiesPercentage = lastMonthCompanies === 0
            ? 0
            : ((currentMonthCompanies - lastMonthCompanies) / lastMonthCompanies * 100).toFixed(1);

        const companiesTrend = currentMonthCompanies >= lastMonthCompanies ? 'up' : 'down';

        // Get total companies count
        const totalCompanies = await Company.count();

        // Get current month enrollees count
        const currentMonthEnrollees = await Enrollee.count({
            where: Sequelize.where(
                Sequelize.fn('EXTRACT', Sequelize.literal('MONTH FROM "created_at"')),
                Sequelize.Op.eq,
                new Date().getMonth() + 1
            ),
            raw: true,
        });

        // Get last month enrollees count
        const lastMonthEnrollees = await Enrollee.count({
            where: Sequelize.where(
                Sequelize.fn('EXTRACT', Sequelize.literal('MONTH FROM "created_at"')),
                Sequelize.Op.eq,
                lastMonth
            ),
            raw: true,
        });

        // Calculate enrollees percentage
        const enrolleesPercentage = lastMonthEnrollees === 0
            ? 0
            : ((currentMonthEnrollees - lastMonthEnrollees) / lastMonthEnrollees * 100).toFixed(1);

        const enrolleesTrend = currentMonthEnrollees >= lastMonthEnrollees ? 'up' : 'down';

        // Get total enrollees count
        const totalEnrollees = await Enrollee.count();

        // Get monthly enrollee dependents added for the current year
        const currentYear = new Date().getFullYear();
        const monthlyDependents = await EnrolleeDependent.sequelize.query(
            `SELECT EXTRACT(MONTH FROM created_at) as month, COUNT(*) as count
             FROM enrollee_dependents
             WHERE EXTRACT(YEAR FROM created_at) = :year
             GROUP BY EXTRACT(MONTH FROM created_at)
             ORDER BY EXTRACT(MONTH FROM created_at)`,
            {
                replacements: { year: currentYear },
                type: Sequelize.QueryTypes.SELECT,
            }
        );

        // Create an array with 12 months initialized to 0
        const monthlySalesData = Array(12).fill(0);

        // Populate the array with actual counts
        monthlyDependents.forEach(({ month, count }) => {
            monthlySalesData[Math.floor(month) - 1] = parseInt(count);
        });

        const data = {
            metrics: {
                companies: {
                    count: totalCompanies,
                    percentage: parseFloat(companiesPercentage),
                    trend: companiesTrend,
                },
                enrollees: {
                    count: totalEnrollees,
                    percentage: parseFloat(enrolleesPercentage),
                    trend: enrolleesTrend,
                },
            },
            monthlySales: {
                data: monthlySalesData,
            },
        };

        return res.status(200).json({
            success: true,
            message: 'Metrics retrieved successfully',
            data,
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getMetrics,
};
