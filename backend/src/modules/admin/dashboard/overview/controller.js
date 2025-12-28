const { sequelize } = require('../../../../database');

// Get companies and enrollees metrics
const getMetrics = async (req, res, next) => {
    try {
        // Get current month companies count
        const currentMonthCompanies = await sequelize.models.Company.count({
            where: sequelize.where(
                sequelize.fn('MONTH', sequelize.col('createdAt')),
                sequelize.op.eq,
                new Date().getMonth() + 1
            ),
            raw: true,
        });

        // Get last month companies count
        const lastMonth = new Date().getMonth() === 0 ? 12 : new Date().getMonth();
        const lastMonthCompanies = await sequelize.models.Company.count({
            where: sequelize.where(
                sequelize.fn('MONTH', sequelize.col('createdAt')),
                sequelize.op.eq,
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
        const totalCompanies = await sequelize.models.Company.count();

        // Get current month enrollees count
        const currentMonthEnrollees = await sequelize.models.Enrollee.count({
            where: sequelize.where(
                sequelize.fn('MONTH', sequelize.col('createdAt')),
                sequelize.op.eq,
                new Date().getMonth() + 1
            ),
            raw: true,
        });

        // Get last month enrollees count
        const lastMonthEnrollees = await sequelize.models.Enrollee.count({
            where: sequelize.where(
                sequelize.fn('MONTH', sequelize.col('createdAt')),
                sequelize.op.eq,
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
        const totalEnrollees = await sequelize.models.Enrollee.count();

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
