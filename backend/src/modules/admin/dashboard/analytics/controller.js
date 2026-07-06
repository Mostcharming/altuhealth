const { Sequelize } = require('sequelize');

// Get analytics metrics
const getMetrics = async (req, res, next) => {
    try {
        const { Subscription, Session, Doctor } = req.models;
        const currentDate = new Date();
        const currentMonth = currentDate.getMonth() + 1;
        const currentYear = currentDate.getFullYear();
        const lastMonth = currentMonth === 1 ? 12 : currentMonth - 1;

        // Get active subscriptions count
        const activeSubscriptions = await Subscription.count({
            where: {
                status: 'active'
            }
        });

        // Get last month active subscriptions for comparison
        const lastMonthActiveSubscriptions = await Subscription.count({
            where: Sequelize.where(
                Sequelize.fn('EXTRACT', Sequelize.literal('MONTH FROM "created_at"')),
                Sequelize.Op.eq,
                lastMonth
            ),
            raw: true,
        });

        const activeSubscriptionsPercentage = lastMonthActiveSubscriptions === 0
            ? 0
            : ((activeSubscriptions - lastMonthActiveSubscriptions) / lastMonthActiveSubscriptions * 100).toFixed(1);

        const activeSubscriptionsTrend = activeSubscriptions >= lastMonthActiveSubscriptions ? 'up' : 'down';

        // Get expired subscriptions count
        const expiredSubscriptions = await Subscription.count({
            where: {
                status: 'expired'
            }
        });

        // Get last month expired subscriptions for comparison
        const lastMonthExpiredSubscriptions = await Subscription.count({
            where: Sequelize.where(
                Sequelize.fn('EXTRACT', Sequelize.literal('MONTH FROM "created_at"')),
                Sequelize.Op.eq,
                lastMonth
            ),
            raw: true,
        });

        const expiredSubscriptionsPercentage = lastMonthExpiredSubscriptions === 0
            ? 0
            : ((expiredSubscriptions - lastMonthExpiredSubscriptions) / lastMonthExpiredSubscriptions * 100).toFixed(1);

        const expiredSubscriptionsTrend = expiredSubscriptions >= lastMonthExpiredSubscriptions ? 'up' : 'down';

        // Get about to expire subscriptions count (within 7 days)
        const sevenDaysFromNow = new Date(currentDate.getTime() + 7 * 24 * 60 * 60 * 1000);
        const aboutToExpire = await Subscription.count({
            where: {
                end_date: {
                    [Sequelize.Op.gte]: currentDate,
                    [Sequelize.Op.lte]: sevenDaysFromNow
                },
                status: {
                    [Sequelize.Op.ne]: 'expired'
                }
            }
        });

        const aboutToExpirePercentage = activeSubscriptions === 0
            ? 0
            : ((aboutToExpire / activeSubscriptions) * 100).toFixed(1);

        const aboutToExpireTrend = aboutToExpire > 0 ? 'up' : 'down';

        // Get sales chart data
        const highestPlans = await Subscription.count({
            where: {
                status: 'active'
            }
        });

        const mostServices = await Session.count({
            where: {
                status: 'completed'
            }
        });

        const highestEnrollees = await Subscription.count({
            where: {
                status: 'active'
            }
        });

        // Get upcoming sessions (next 7 days)
        const nextWeek = new Date(currentDate.getTime() + 7 * 24 * 60 * 60 * 1000);
        const upcomingSessions = await Session.findAll({
            attributes: ['id', 'sessionDate', 'startTime', 'status'],
            include: [
                {
                    association: 'doctor',
                    attributes: ['id', 'firstName', 'lastName', 'specialization'],
                    required: true
                },
                {
                    association: 'enrollee',
                    attributes: ['id', 'firstName', 'lastName'],
                    required: true
                }
            ],
            where: {
                sessionDate: {
                    [Sequelize.Op.gte]: currentDate,
                    [Sequelize.Op.lte]: nextWeek
                },
                status: {
                    [Sequelize.Op.in]: ['scheduled', 'confirmed']
                }
            },
            order: [['sessionDate', 'ASC'], ['startTime', 'ASC']],
            limit: 4,
            raw: false
        });

        // Format upcoming sessions
        const upcomingSessionsData = upcomingSessions.map((session, index) => ({
            id: session.id,
            doctorName: session.doctor ? `${session.doctor.firstName} ${session.doctor.lastName}` : 'N/A',
            specialty: session.doctor?.specialization || 'N/A',
            sessionDate: new Date(session.sessionDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
            sessionTime: session.startTime,
            patientName: session.enrollee ? `${session.enrollee.firstName} ${session.enrollee.lastName}` : 'N/A',
            status: session.status
        }));

        // Get doctors with their metrics
        const doctors = await Doctor.findAll({
            attributes: ['id', 'firstName', 'lastName', 'specialization', 'profilePictureUrl', 'isOnline', 'availableFrom', 'availableTo', 'averageRating', 'createdAt'],
            where: {
                status: 'active'
            },
            order: [['createdAt', 'DESC']],
            limit: 5,
            raw: false
        });

        // Enhance doctors with booking and patient counts
        const doctorsData = await Promise.all(
            doctors.map(async (doctor) => {
                const bookingsCount = await Session.count({
                    where: {
                        doctorId: doctor.id,
                        status: 'completed'
                    }
                });

                const patientsCount = await Session.findAll({
                    attributes: [
                        [Sequelize.fn('COUNT', Sequelize.fn('DISTINCT', Sequelize.col('enrolleeId'))), 'count']
                    ],
                    where: {
                        doctorId: doctor.id
                    },
                    raw: true
                }).then(result => parseInt(result[0]?.count || 0));

                const initials = `${doctor.firstName.charAt(0).toUpperCase()}${doctor.lastName.charAt(0).toUpperCase()}`;

                return {
                    id: doctor.id,
                    user: {
                        initials,
                        name: `${doctor.firstName} ${doctor.lastName}`,
                        email: doctor.email || 'N/A'
                    },
                    profilePictureUrl: doctor.profilePictureUrl || null,
                    isOnline: doctor.isOnline || false,
                    availableFrom: doctor.availableFrom || 'N/A',
                    bookingsCount,
                    specialty: doctor.specialization,
                    rating: doctor.averageRating || 0,
                    totalPatients: patientsCount
                };
            })
        );

        const data = {
            metrics: {
                activeSubscriptions: {
                    count: activeSubscriptions,
                    percentage: parseFloat(activeSubscriptionsPercentage),
                    trend: activeSubscriptionsTrend,
                },
                expiredSubscriptions: {
                    count: expiredSubscriptions,
                    percentage: parseFloat(expiredSubscriptionsPercentage),
                    trend: expiredSubscriptionsTrend,
                },
                aboutToExpire: {
                    count: aboutToExpire,
                    percentage: parseFloat(aboutToExpirePercentage),
                    trend: aboutToExpireTrend,
                }
            },
            saleChart: {
                highestPlans: highestPlans,
                mostServices: mostServices,
                highestEnrollees: highestEnrollees
            },
            upcomingSessions: upcomingSessionsData,
            doctors: doctorsData
        };

        return res.status(200).json({
            success: true,
            message: 'Analytics metrics retrieved successfully',
            data,
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getMetrics,
};
