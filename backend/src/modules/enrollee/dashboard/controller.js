/**
 * Get dashboard data for enrollee
 * Returns metrics, statistics, health plan, benefits, and appointments
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
        } = req.models || {};
        const enrolleeId = req.user?.id;

        if (!enrolleeId) {
            return res.fail('Unauthorized access', 401);
        }

        if (!Enrollee || !Appointment || !CompanyPlan || !PlanBenefit || !CompanyPlanBenefit) {
            throw new Error('Database models are not available');
        }

        // Fetch enrollee data
        const enrollee = await Enrollee.findByPk(enrolleeId, {
            attributes: [
                'id',
                'firstName',
                'lastName',
                'policyNumber',
                'companyPlanId',
                'enrollmentDate',
                'expirationDate',
                'isActive',
            ],
            include: [
                {
                    model: CompanyPlan,
                    as: 'companyPlan',
                    attributes: ['id', 'name', 'planType', 'planId', 'currency'],
                    required: false,
                },
            ],
        });

        if (!enrollee) {
            return res.fail('Enrollee not found', 404);
        }

        const enrolleeJson = enrollee.toJSON();
        const renewalDate = enrollee.expirationDate
            ? new Date(enrollee.expirationDate)
            : new Date(
                new Date(enrollee.enrollmentDate).getFullYear() + 1,
                new Date(enrollee.enrollmentDate).getMonth(),
                new Date(enrollee.enrollmentDate).getDate()
            );
        const today = new Date();
        const daysUntilRenewal = Number.isNaN(renewalDate.getTime())
            ? 0
            : Math.max(0, Math.ceil((renewalDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)));

        // Fetch appointments
        const appointments = await Appointment.findAll({
            where: { enrolleeId },
            attributes: ['id', 'complaint', 'appointmentDateTime', 'status'],
            include: Provider
                ? [
                    {
                        model: Provider,
                        attributes: ['id', 'name'],
                        required: false,
                    },
                ]
                : [],
            order: [['appointmentDateTime', 'ASC']],
            limit: 5,
        });

        // Fetch benefits data
        const companyPlan = enrolleeJson.companyPlan;
        const totalBenefits = companyPlan?.planType === 'standard' && companyPlan?.planId
            ? await PlanBenefit.count({ where: { planId: companyPlan.planId } })
            : await CompanyPlanBenefit.count({ where: { companyPlanId: enrollee.companyPlanId } });

        const usedPercentage = 0;
        const remainingPercentage = totalBenefits > 0 ? 100 : 0;
        const availablePercentage = totalBenefits > 0 ? 100 : 0;

        const appointmentCount = await Appointment.count({ where: { enrolleeId } });

        // Build response data
        const dashboardData = {
            enrollee: {
                firstName: enrollee.firstName,
                lastName: enrollee.lastName,
                policyNumber: enrollee.policyNumber,
            },
            metrics: [
                {
                    id: 1,
                    title: 'Medical Visits',
                    value: String(appointmentCount),
                    change: '+0%',
                    direction: 'up',
                    comparisonText: 'total',
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
                status: enrollee.isActive ? 'Active' : 'Inactive',
                name: companyPlan?.name || null,
            },
            benefits: {
                availablePercentage,
                usedPercentage,
                remainingPercentage,
                totalBenefits: totalBenefits.toLocaleString(),
            },
            appointments: appointments.map((apt) => {
                const appointmentJson = apt.toJSON();
                const appointmentDate = appointmentJson.appointmentDateTime
                    ? new Date(appointmentJson.appointmentDateTime)
                    : null;

                return {
                    id: appointmentJson.id,
                    title: appointmentJson.complaint || 'Appointment',
                    date: appointmentDate && !Number.isNaN(appointmentDate.getTime())
                        ? appointmentDate.toISOString().slice(0, 10)
                        : null,
                    time: appointmentDate && !Number.isNaN(appointmentDate.getTime())
                        ? appointmentDate.toTimeString().slice(0, 5)
                        : null,
                    status: appointmentJson.status,
                    doctor: appointmentJson.Provider?.name || null,
                };
            }),
        };

        return res.success(dashboardData, 'Dashboard data fetched successfully');
    } catch (error) {
        next(error);
    }
};
