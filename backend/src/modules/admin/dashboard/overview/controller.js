const { Sequelize } = require('sequelize');

// Get companies and enrollees metrics
const getMetrics = async (req, res, next) => {
    try {
        const { Company, Enrollee, EnrolleeDependent, Staff, RetailEnrollee, RetailEnrolleeDependent, Provider, Service, Drug } = req.models;
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

        // Get staff enrollment metrics
        const totalStaff = await Staff.count();
        const activatedStaff = await Staff.count({
            where: {
                enrollmentStatus: 'enrolled'
            }
        });
        const pendingStaff = totalStaff - activatedStaff;
        const enrollmentPercentage = totalStaff === 0
            ? 0
            : parseFloat((activatedStaff / totalStaff * 100).toFixed(2));

        // Get monthly retail enrollees for the current year
        const monthlyRetailEnrollees = await RetailEnrollee.sequelize.query(
            `SELECT EXTRACT(MONTH FROM created_at) as month, COUNT(*) as count
             FROM retail_enrollees
             WHERE EXTRACT(YEAR FROM created_at) = :year
             GROUP BY EXTRACT(MONTH FROM created_at)
             ORDER BY EXTRACT(MONTH FROM created_at)`,
            {
                replacements: { year: currentYear },
                type: Sequelize.QueryTypes.SELECT,
            }
        );

        // Get monthly active dependent enrollees for the current year
        const monthlyActiveDependents = await RetailEnrolleeDependent.sequelize.query(
            `SELECT EXTRACT(MONTH FROM created_at) as month, COUNT(*) as count
             FROM retail_enrollee_dependents
             WHERE EXTRACT(YEAR FROM created_at) = :year AND is_active = true
             GROUP BY EXTRACT(MONTH FROM created_at)
             ORDER BY EXTRACT(MONTH FROM created_at)`,
            {
                replacements: { year: currentYear },
                type: Sequelize.QueryTypes.SELECT,
            }
        );

        // Create arrays with 12 months initialized to 0
        const monthlyRetailEnrolleesData = Array(12).fill(0);
        const monthlyActiveDependentsData = Array(12).fill(0);

        // Populate the arrays with actual counts
        monthlyRetailEnrollees.forEach(({ month, count }) => {
            monthlyRetailEnrolleesData[Math.floor(month) - 1] = parseInt(count);
        });

        monthlyActiveDependents.forEach(({ month, count }) => {
            monthlyActiveDependentsData[Math.floor(month) - 1] = parseInt(count);
        });

        // Get recent providers with services and drugs count
        const recentProviders = await Provider.findAll({
            attributes: ['id', 'name', 'status', 'picture'],
            where: {
                isDeleted: false,
                status: 'active'
            },
            order: [['created_at', 'DESC']],
            limit: 5,
            raw: false
        });

        // Enhance recent providers with services and drugs count
        const recentProvidersData = await Promise.all(
            recentProviders.map(async (provider) => {
                const servicesCount = await Service.count({
                    where: {
                        providerId: provider.id,
                        isDeleted: false,
                        status: 'active'
                    }
                });

                const drugsCount = await Drug.count({
                    where: {
                        providerId: provider.id,
                        isDeleted: false,
                        status: 'active'
                    }
                });

                return {
                    id: provider.id,
                    name: provider.name,
                    services: servicesCount,
                    drugs: drugsCount,
                    status: provider.status.charAt(0).toUpperCase() + provider.status.slice(1),
                    image: provider.picture || '/images/provider/default-provider.jpg'
                };
            })
        );

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
            staffEnrollment: {
                totalStaff,
                activated: activatedStaff,
                pending: pendingStaff,
                enrollmentPercentage,
            },
            statistics: {
                retailEnrollees: monthlyRetailEnrolleesData,
                activeDependentEnrollees: monthlyActiveDependentsData,
            },
            recentProviders: recentProvidersData,
            demographics: [
                {
                    country: "Nigeria",
                    enrollees: totalEnrollees,
                    flag: "/images/country/country-ng.svg",
                },
            ],
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
