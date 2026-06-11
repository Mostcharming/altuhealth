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
    const start = new Date(date.getFullYear(), date.getMonth() - 1, 1);
    const end = new Date(date.getFullYear(), date.getMonth(), 1);
    return { start, end };
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

    const diff = Math.round(((current - previous) / previous) * 100);
    return {
        change: `${diff >= 0 ? '+' : ''}${diff}%`,
        direction: diff > 0 ? 'up' : diff < 0 ? 'down' : 'neutral'
    };
}

function formatCurrency(value) {
    return new Intl.NumberFormat('en-NG', {
        style: 'currency',
        currency: 'NGN'
    }).format(toNumber(value));
}

function appointmentTitle(appointment) {
    if (appointment.complaint) return appointment.complaint;
    return 'Provider appointment';
}

function enrolleeName(enrollee) {
    if (!enrollee) return 'Enrollee';
    return [enrollee.firstName, enrollee.lastName].filter(Boolean).join(' ').trim() || enrollee.email || 'Enrollee';
}

async function getOverview(req, res, next) {
    try {
        const {
            Appointment,
            AuthorizationCode,
            AuthorizationCodeRendered,
            Claim,
            Drug,
            Service,
            Enrollee
        } = req.models;
        const providerId = req.user?.id;

        if (!providerId) return res.fail('Provider ID is required', 400);

        const now = new Date();
        const thisMonthStart = startOfMonth(now);
        const nextMonthStart = startOfNextMonth(now);
        const { start: previousMonthStart, end: previousMonthEnd } = previousMonthRange(now);
        const yearStart = startOfYear(now);

        const [
            currentVisits,
            previousVisits,
            currentDrugs,
            previousDrugs,
            currentServices,
            previousServices,
            totalDrugs,
            totalServices,
            claims,
            authCodes,
            renderedItems,
            upcomingAppointments
        ] = await Promise.all([
            Appointment.count({
                where: {
                    providerId,
                    status: 'attended',
                    appointmentDateTime: { [Op.gte]: thisMonthStart, [Op.lt]: nextMonthStart }
                }
            }),
            Appointment.count({
                where: {
                    providerId,
                    status: 'attended',
                    appointmentDateTime: { [Op.gte]: previousMonthStart, [Op.lt]: previousMonthEnd }
                }
            }),
            Drug.count({
                where: {
                    providerId,
                    isDeleted: false,
                    createdAt: { [Op.gte]: thisMonthStart, [Op.lt]: nextMonthStart }
                }
            }),
            Drug.count({
                where: {
                    providerId,
                    isDeleted: false,
                    createdAt: { [Op.gte]: previousMonthStart, [Op.lt]: previousMonthEnd }
                }
            }),
            Service.count({
                where: {
                    providerId,
                    isDeleted: false,
                    createdAt: { [Op.gte]: thisMonthStart, [Op.lt]: nextMonthStart }
                }
            }),
            Service.count({
                where: {
                    providerId,
                    isDeleted: false,
                    createdAt: { [Op.gte]: previousMonthStart, [Op.lt]: previousMonthEnd }
                }
            }),
            Drug.count({ where: { providerId, isDeleted: false } }),
            Service.count({ where: { providerId, isDeleted: false } }),
            Claim.findAll({
                where: { providerId },
                attributes: ['status', 'amountSubmitted', 'amountProcessed']
            }),
            AuthorizationCode.findAll({
                where: {
                    providerId,
                    createdAt: { [Op.gte]: yearStart }
                },
                attributes: ['id', 'status', 'isUsed']
            }),
            AuthorizationCodeRendered.findAll({
                attributes: ['id', 'drugId', 'serviceId', 'quantityRendered', 'createdAt'],
                include: [
                    {
                        model: AuthorizationCode,
                        attributes: ['id', 'providerId'],
                        required: true,
                        where: {
                            providerId,
                            createdAt: { [Op.gte]: yearStart }
                        }
                    }
                ]
            }),
            Appointment.findAll({
                where: {
                    providerId,
                    status: { [Op.in]: ['pending', 'approved', 'rescheduled'] },
                    appointmentDateTime: { [Op.gte]: now }
                },
                include: [
                    {
                        model: Enrollee,
                        attributes: ['id', 'firstName', 'lastName', 'email'],
                        required: false
                    }
                ],
                order: [['appointmentDateTime', 'ASC']],
                limit: 5
            })
        ]);

        const visitsChange = change(currentVisits, previousVisits);
        const drugsChange = change(currentDrugs, previousDrugs);
        const servicesChange = change(currentServices, previousServices);

        const monthlyData = {
            drugs: Array(12).fill(0),
            services: Array(12).fill(0)
        };

        let drugsUsed = 0;
        let servicesUsed = 0;

        renderedItems.forEach((item) => {
            const month = new Date(item.createdAt).getMonth();
            const quantity = toNumber(item.quantityRendered) || 1;

            if (item.drugId) {
                drugsUsed += quantity;
                monthlyData.drugs[month] += quantity;
            }

            if (item.serviceId) {
                servicesUsed += quantity;
                monthlyData.services[month] += quantity;
            }
        });

        const renderedTotal = drugsUsed + servicesUsed;
        const totalSubmittedAmount = claims.reduce((sum, claim) => sum + toNumber(claim.amountSubmitted), 0);
        const paidAmount = claims
            .filter((claim) => claim.status === 'paid')
            .reduce((sum, claim) => sum + toNumber(claim.amountProcessed || claim.amountSubmitted), 0);
        const draftAmount = claims
            .filter((claim) => claim.status === 'draft')
            .reduce((sum, claim) => sum + toNumber(claim.amountSubmitted), 0);

        const requestedCount = authCodes.length;
        const usedCount = authCodes.filter((code) => code.isUsed || code.status === 'used').length;
        const cancelledCount = authCodes.filter((code) => code.status === 'cancelled').length;

        return res.success({
            metrics: [
                {
                    id: 1,
                    title: 'Enrollee Visits',
                    value: String(currentVisits),
                    comparisonText: 'this month',
                    ...visitsChange
                },
                {
                    id: 2,
                    title: 'Total Drugs',
                    value: String(totalDrugs),
                    comparisonText: 'this month',
                    ...drugsChange
                },
                {
                    id: 3,
                    title: 'Total Services',
                    value: String(totalServices),
                    comparisonText: 'this month',
                    ...servicesChange
                }
            ],
            statisticsChart: {
                drugsUsed,
                drugsPercentage: percent(drugsUsed, renderedTotal),
                servicesUsed,
                servicesPercentage: percent(servicesUsed, renderedTotal),
                monthlyData
            },
            bills: {
                totalBilled: formatCurrency(totalSubmittedAmount),
                totalBilledAmount: totalSubmittedAmount,
                billsPaid: formatCurrency(paidAmount),
                billsPaidPercentage: percent(paidAmount, totalSubmittedAmount),
                billsDraft: formatCurrency(draftAmount),
                billsDraftPercentage: percent(draftAmount, totalSubmittedAmount)
            },
            authorizationCodes: {
                requestedCount,
                requestedPercentage: requestedCount ? 100 : 0,
                usedCount,
                usedPercentage: percent(usedCount, requestedCount),
                cancelledCount,
                cancelledPercentage: percent(cancelledCount, requestedCount)
            },
            appointments: upcomingAppointments.map((appointment) => {
                const date = new Date(appointment.appointmentDateTime);
                return {
                    id: appointment.id,
                    title: appointmentTitle(appointment),
                    date: appointment.appointmentDateTime,
                    time: date.toLocaleTimeString('en-US', {
                        hour: '2-digit',
                        minute: '2-digit'
                    }),
                    enrolleeName: enrolleeName(appointment.Enrollee)
                };
            })
        }, 'Provider dashboard retrieved successfully');
    } catch (error) {
        return next(error);
    }
}

module.exports = {
    getOverview
};
