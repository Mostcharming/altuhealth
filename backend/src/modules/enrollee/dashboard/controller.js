'use strict';

const { Op } = require('sequelize');

function startOfMonth(date = new Date()) {
    return new Date(date.getFullYear(), date.getMonth(), 1);
}

function startOfNextMonth(date = new Date()) {
    return new Date(date.getFullYear(), date.getMonth() + 1, 1);
}

function startOfYear(date = new Date()) {
    return new Date(date.getFullYear(), 0, 1);
}

function previousMonthRange(date = new Date()) {
    return {
        start: new Date(date.getFullYear(), date.getMonth() - 1, 1),
        end: new Date(date.getFullYear(), date.getMonth(), 1)
    };
}

function toNumber(value) {
    const number = Number(value || 0);
    return Number.isFinite(number) ? number : 0;
}

function percent(part, total) {
    if (!total) return 0;
    return Math.round((part / total) * 100);
}

function change(current, previous) {
    if (!previous && !current) return { change: '+0%', direction: 'neutral' };
    if (!previous) return { change: '+100%', direction: 'up' };

    const difference = Math.round(((current - previous) / previous) * 100);
    return {
        change: `${difference >= 0 ? '+' : ''}${difference}%`,
        direction: difference > 0 ? 'up' : difference < 0 ? 'down' : 'neutral'
    };
}

function isWithin(date, start, end) {
    return date instanceof Date
        && !Number.isNaN(date.getTime())
        && date >= start
        && date < end;
}

function resolveRenewalDate(enrollee) {
    if (enrollee.expirationDate) {
        const expirationDate = new Date(enrollee.expirationDate);
        if (!Number.isNaN(expirationDate.getTime())) return expirationDate;
    }

    if (!enrollee.enrollmentDate) return null;

    const enrollmentDate = new Date(enrollee.enrollmentDate);
    if (Number.isNaN(enrollmentDate.getTime())) return null;

    return new Date(
        enrollmentDate.getFullYear() + 1,
        enrollmentDate.getMonth(),
        enrollmentDate.getDate()
    );
}

/**
 * Get live dashboard data for the authenticated enrollee.
 */
exports.getDashboardData = async (req, res, next) => {
    try {
        const {
            Enrollee,
            Appointment,
            Provider,
            CompanyPlan,
            PlanBenefit,
            CompanyPlanBenefit,
            AuthorizationCode,
            AuthorizationCodeRendered
        } = req.models || {};
        const enrolleeId = req.user?.id;

        if (!enrolleeId) {
            return res.fail('Unauthorized access', 401);
        }

        if (
            !Enrollee
            || !Appointment
            || !CompanyPlan
            || !PlanBenefit
            || !CompanyPlanBenefit
            || !AuthorizationCode
            || !AuthorizationCodeRendered
        ) {
            throw new Error('Database models are not available');
        }

        const enrollee = await Enrollee.findByPk(enrolleeId, {
            attributes: [
                'id',
                'firstName',
                'lastName',
                'policyNumber',
                'companyPlanId',
                'enrollmentDate',
                'expirationDate',
                'isActive'
            ],
            include: [
                {
                    model: CompanyPlan,
                    as: 'companyPlan',
                    attributes: ['id', 'name', 'planType', 'planId', 'currency'],
                    required: false
                }
            ]
        });

        if (!enrollee) {
            return res.fail('Enrollee not found', 404);
        }

        const now = new Date();
        const thisMonthStart = startOfMonth(now);
        const nextMonthStart = startOfNextMonth(now);
        const { start: previousMonthStart, end: previousMonthEnd } = previousMonthRange(now);
        const yearStart = startOfYear(now);
        const activityStart = previousMonthStart < yearStart ? previousMonthStart : yearStart;
        const companyPlan = enrollee.companyPlan || enrollee.toJSON().companyPlan;

        const totalBenefitsPromise = companyPlan?.planType === 'standard' && companyPlan?.planId
            ? PlanBenefit.count({ where: { planId: companyPlan.planId } })
            : enrollee.companyPlanId
                ? CompanyPlanBenefit.count({ where: { companyPlanId: enrollee.companyPlanId } })
                : Promise.resolve(0);

        const [
            attendedAppointments,
            upcomingAppointments,
            authorizationCodes,
            totalBenefits
        ] = await Promise.all([
            Appointment.findAll({
                where: {
                    enrolleeId,
                    status: 'attended',
                    appointmentDateTime: { [Op.gte]: activityStart, [Op.lt]: nextMonthStart }
                },
                attributes: ['id', 'appointmentDateTime'],
                order: [['appointmentDateTime', 'ASC']]
            }),
            Appointment.findAll({
                where: {
                    enrolleeId,
                    status: { [Op.in]: ['pending', 'approved', 'rescheduled'] },
                    appointmentDateTime: { [Op.gte]: now }
                },
                attributes: ['id', 'complaint', 'appointmentDateTime', 'status'],
                include: Provider
                    ? [
                        {
                            model: Provider,
                            attributes: ['id', 'name'],
                            required: false
                        }
                    ]
                    : [],
                order: [['appointmentDateTime', 'ASC']],
                limit: 5
            }),
            AuthorizationCode.findAll({
                where: { enrolleeId },
                attributes: [
                    'id',
                    'status',
                    'isUsed',
                    'usedAt',
                    'createdAt',
                    'updatedAt'
                ]
            }),
            totalBenefitsPromise
        ]);

        const usedAuthorizationCodes = authorizationCodes.filter(
            (code) => code.isUsed || code.status === 'used'
        );
        const usedAuthorizationIds = usedAuthorizationCodes.map((code) => code.id);
        const renderedItems = usedAuthorizationIds.length
            ? await AuthorizationCodeRendered.findAll({
                where: {
                    authorizationCodeId: { [Op.in]: usedAuthorizationIds },
                    status: { [Op.ne]: 'rejected' }
                },
                attributes: [
                    'id',
                    'authorizationCodeId',
                    'drugId',
                    'serviceId',
                    'quantityRendered'
                ]
            })
            : [];

        const authorizationById = new Map(
            usedAuthorizationCodes.map((code) => [String(code.id), code])
        );
        const monthlyMedications = Array(12).fill(0);
        const monthlyVisits = Array(12).fill(0);
        let currentMedications = 0;
        let previousMedications = 0;
        let currentServices = 0;
        let previousServices = 0;

        renderedItems.forEach((item) => {
            const authorizationCode = authorizationById.get(String(item.authorizationCodeId));
            const usageDate = new Date(
                authorizationCode?.usedAt
                || authorizationCode?.updatedAt
                || authorizationCode?.createdAt
            );
            const quantity = Math.max(1, toNumber(item.quantityRendered));

            if (item.drugId) {
                if (isWithin(usageDate, thisMonthStart, nextMonthStart)) {
                    currentMedications += quantity;
                }
                if (isWithin(usageDate, previousMonthStart, previousMonthEnd)) {
                    previousMedications += quantity;
                }
                if (isWithin(usageDate, yearStart, new Date(now.getFullYear() + 1, 0, 1))) {
                    monthlyMedications[usageDate.getMonth()] += quantity;
                }
            }

            if (item.serviceId) {
                if (isWithin(usageDate, thisMonthStart, nextMonthStart)) {
                    currentServices += quantity;
                }
                if (isWithin(usageDate, previousMonthStart, previousMonthEnd)) {
                    previousServices += quantity;
                }
            }
        });

        let currentVisits = 0;
        let previousVisits = 0;
        attendedAppointments.forEach((appointment) => {
            const appointmentDate = new Date(appointment.appointmentDateTime);

            if (isWithin(appointmentDate, thisMonthStart, nextMonthStart)) {
                currentVisits += 1;
            }
            if (isWithin(appointmentDate, previousMonthStart, previousMonthEnd)) {
                previousVisits += 1;
            }
            if (isWithin(appointmentDate, yearStart, new Date(now.getFullYear() + 1, 0, 1))) {
                monthlyVisits[appointmentDate.getMonth()] += 1;
            }
        });

        const annualMedications = monthlyMedications.reduce((sum, value) => sum + value, 0);
        const annualVisits = monthlyVisits.reduce((sum, value) => sum + value, 0);
        const usedPercentage = percent(usedAuthorizationCodes.length, authorizationCodes.length);
        const renewalDate = resolveRenewalDate(enrollee);
        const daysUntilRenewal = renewalDate
            ? Math.max(0, Math.ceil((renewalDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)))
            : 0;
        const hasExpired = renewalDate ? renewalDate.getTime() < now.getTime() : false;
        const planStatus = !enrollee.isActive
            ? 'Inactive'
            : hasExpired
                ? 'Expired'
                : 'Active';

        return res.success({
            enrollee: {
                firstName: enrollee.firstName,
                lastName: enrollee.lastName,
                policyNumber: enrollee.policyNumber
            },
            metrics: [
                {
                    id: 1,
                    title: 'Medical Visits',
                    value: String(currentVisits),
                    comparisonText: 'this month',
                    ...change(currentVisits, previousVisits)
                },
                {
                    id: 2,
                    title: 'Medications Used',
                    value: String(currentMedications),
                    comparisonText: 'this month',
                    ...change(currentMedications, previousMedications)
                },
                {
                    id: 3,
                    title: 'Healthcare Services',
                    value: String(currentServices),
                    comparisonText: 'this month',
                    ...change(currentServices, previousServices)
                }
            ],
            statisticsChart: {
                medicationsClaimed: annualMedications,
                medicationsPercentage: percent(currentMedications, annualMedications),
                visitsCompleted: annualVisits,
                visitsPercentage: percent(currentVisits, annualVisits),
                monthlyData: {
                    medications: monthlyMedications,
                    visits: monthlyVisits
                }
            },
            healthPlan: {
                daysUntilRenewal,
                renewalDate: renewalDate ? renewalDate.toISOString() : null,
                status: planStatus,
                name: companyPlan?.name || null,
                currency: companyPlan?.currency || null
            },
            benefits: {
                totalBenefits,
                authorizationRequests: authorizationCodes.length,
                usedAuthorizations: usedAuthorizationCodes.length,
                activeAuthorizations: authorizationCodes.filter((code) => code.status === 'active').length,
                usedPercentage,
                remainingPercentage: authorizationCodes.length ? 100 - usedPercentage : 0
            },
            appointments: upcomingAppointments.map((appointment) => {
                const appointmentJson = appointment.toJSON();
                const appointmentDate = new Date(appointmentJson.appointmentDateTime);

                return {
                    id: appointmentJson.id,
                    title: appointmentJson.complaint || 'Appointment',
                    date: appointmentDate.toISOString(),
                    time: appointmentDate.toLocaleTimeString('en-NG', {
                        hour: '2-digit',
                        minute: '2-digit'
                    }),
                    status: appointmentJson.status,
                    doctor: appointmentJson.Provider?.name || 'Assigned provider'
                };
            })
        }, 'Dashboard data fetched successfully');
    } catch (error) {
        return next(error);
    }
};
