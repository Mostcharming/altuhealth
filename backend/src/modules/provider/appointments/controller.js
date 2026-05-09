'use strict';

const { Op } = require('sequelize');
const { addEnrolleeNotification } = require('../../../utils/addNotifications');
const notify = require('../../../utils/notify');

async function listAppointments(req, res, next) {
    try {
        const { Appointment, Enrollee, Provider, Company, CompanySubsidiary } = req.models;
        const providerId = req.user?.id;

        if (!providerId) return res.fail('Provider ID is required', 400);

        const { limit = 10, page = 1, q, status } = req.query;

        const isAll = String(limit).toLowerCase() === 'all';
        const limitNum = isAll ? 0 : Number(limit);
        const pageNum = isAll ? 1 : (Number(page) || 1);
        const offset = isAll ? 0 : (pageNum - 1) * limitNum;

        const where = {
            providerId // Only show appointments for the current provider
        };

        if (status) {
            where.status = status;
        }

        if (q) {
            where[Op.or] = [
                { complaint: { [Op.iLike || Op.like]: `%${q}%` } },
                { notes: { [Op.iLike || Op.like]: `%${q}%` } }
            ];
        }

        const total = await Appointment.count({ where });

        const findOptions = {
            where,
            order: [['appointmentDateTime', 'DESC']],
            include: [
                {
                    model: Enrollee,
                    attributes: ['id', 'firstName', 'lastName', 'email', 'phoneNumber'],
                    required: false
                },
                {
                    model: Company,
                    attributes: ['id', 'name', 'email', 'phoneNumber'],
                    required: false
                },
                {
                    model: CompanySubsidiary,
                    attributes: ['id', 'name'],
                    required: false,
                    as: 'subsidiary'
                }
            ]
        };

        if (!isAll) {
            findOptions.limit = limitNum;
            findOptions.offset = Number(offset);
        }

        const appointments = await Appointment.findAll(findOptions);
        const data = appointments.map(ap => ap.toJSON());

        const hasPrevPage = !isAll && pageNum > 1;
        const hasNextPage = !isAll && (offset + appointments.length < total);
        const totalPages = isAll ? 1 : (limitNum > 0 ? Math.ceil(total / limitNum) : 1);

        return res.success({
            list: data,
            count: total,
            page: pageNum,
            limit: isAll ? 'all' : limitNum,
            totalPages,
            hasNextPage,
            hasPrevPage
        });
    } catch (err) {
        return next(err);
    }
}

async function getAppointment(req, res, next) {
    try {
        const { Appointment, Enrollee, Company, CompanySubsidiary } = req.models;
        const { id } = req.params;
        const providerId = req.user?.id;

        if (!providerId) return res.fail('Provider ID is required', 400);

        const appointment = await Appointment.findByPk(id, {
            include: [
                {
                    model: Enrollee,
                    attributes: ['id', 'firstName', 'lastName', 'email', 'phoneNumber'],
                    required: false
                },
                {
                    model: Company,
                    attributes: ['id', 'name', 'email', 'phoneNumber'],
                    required: false
                },
                {
                    model: CompanySubsidiary,
                    attributes: ['id', 'name'],
                    required: false,
                    as: 'subsidiary'
                }
            ]
        });

        if (!appointment) return res.fail('Appointment not found', 404);

        // Ensure provider can only see their own appointments
        if (appointment.providerId !== providerId) {
            return res.fail('Unauthorized access to this appointment', 403);
        }

        return res.success(appointment.toJSON());
    } catch (err) {
        return next(err);
    }
}

async function updateAppointmentStatus(req, res, next) {
    try {
        const { Appointment, Enrollee, Provider } = req.models;
        const { id } = req.params;
        const providerId = req.user?.id;

        if (!providerId) return res.fail('Provider ID is required', 400);

        const appointment = await Appointment.findByPk(id);
        if (!appointment) return res.fail('Appointment not found', 404);

        // Ensure provider can only update their own appointments
        if (appointment.providerId !== providerId) {
            return res.fail('Unauthorized access to this appointment', 403);
        }

        const { status, rejectionReason } = req.body || {};

        if (!status) return res.fail('`status` is required', 400);

        // Validate status transitions
        const validStatuses = ['pending', 'approved', 'rejected', 'attended', 'missed', 'cancelled', 'rescheduled'];
        if (!validStatuses.includes(status)) {
            return res.fail(`Invalid status. Must be one of: ${validStatuses.join(', ')}`, 400);
        }

        // Can only update pending or approved appointments (cannot update attended, missed, cancelled)
        if (['attended', 'missed', 'cancelled', 'rescheduled'].includes(appointment.status)) {
            return res.fail(`Cannot update a ${appointment.status} appointment`, 400);
        }

        // If rejecting, rejection reason is required
        if (status === 'rejected' && !rejectionReason) {
            return res.fail('`rejectionReason` is required when rejecting an appointment', 400);
        }

        const updates = { status };
        if (rejectionReason) updates.rejectionReason = rejectionReason;
        if (status === 'approved') updates.approvedBy = providerId;
        if (status === 'rejected') updates.rejectedBy = providerId;

        await appointment.update(updates);

        // Send notifications to enrollee (non-blocking)
        try {
            const enrollee = await Enrollee.findByPk(appointment.enrolleeId);
            const provider = await Provider.findByPk(providerId);

            if (enrollee && provider) {
                const appointmentDate = new Date(appointment.appointmentDateTime);
                const formattedDateTime = appointmentDate.toLocaleString('en-US', {
                    weekday: 'short',
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit'
                });

                let notificationTitle = '';
                let templateName = '';
                let shortCodes = {
                    enrolleeName: `${enrollee.firstName} ${enrollee.lastName}`,
                    providerName: provider.name,
                    appointmentDateTime: formattedDateTime,
                    appointmentLink: `${process.env.FE_ENROLLEE_URL || 'https://enrollee.altuhealth.com'}/appointments/${id}`
                };

                if (status === 'approved') {
                    notificationTitle = `Appointment Approved - ${provider.name}`;
                    templateName = 'APPOINTMENT_APPROVED';
                    shortCodes = {
                        ...shortCodes,
                        providerCategory: provider.category || 'General Practitioner',
                        providerAddress: provider.address || 'See appointment details',
                        providerPhone: provider.phoneNumber || 'N/A'
                    };
                } else if (status === 'rejected') {
                    notificationTitle = `Appointment Request Declined - ${provider.name}`;
                    templateName = 'APPOINTMENT_REJECTED';
                    shortCodes = {
                        ...shortCodes,
                        rejectionReason: rejectionReason || 'Provider unavailable'
                    };
                } else if (status === 'attended') {
                    notificationTitle = `Appointment Completed - ${provider.name}`;
                    templateName = 'APPOINTMENT_ATTENDED';
                } else if (status === 'missed') {
                    notificationTitle = `Appointment Missed - ${provider.name}`;
                    templateName = 'APPOINTMENT_MISSED';
                    shortCodes = {
                        ...shortCodes,
                        providerAddress: provider.address || 'See appointment details',
                        providerPhone: provider.phoneNumber || 'Contact provider'
                    };
                }

                // Create in-app notification for enrollee
                if (templateName) {
                    let notificationType = '';
                    if (status === 'approved') notificationType = 'appointment_approved';
                    else if (status === 'rejected') notificationType = 'appointment_rejected';
                    else if (status === 'attended') notificationType = 'appointment_attended';
                    else if (status === 'missed') notificationType = 'appointment_missed';

                    await addEnrolleeNotification(req.models, {
                        enrolleeId: appointment.enrolleeId,
                        title: notificationTitle,
                        message: status === 'rejected'
                            ? `Your appointment on ${formattedDateTime} has been declined. Reason: ${rejectionReason}`
                            : `Your appointment on ${formattedDateTime} status has been updated to: ${status}`,
                        clickUrl: `appointments/${id}`,
                        notificationType
                    });

                    // Send email notification to enrollee
                    await notify(
                        enrollee,
                        'Enrollee',
                        templateName,
                        shortCodes,
                        ['email'],
                        true
                    );
                }
            }
        } catch (notifErr) {
            console.error('Error sending appointment status notifications:', notifErr);
        }

        return res.success({ appointment: appointment.toJSON() }, 'Appointment status updated');
    } catch (err) {
        return next(err);
    }
}

module.exports = {
    listAppointments,
    getAppointment,
    updateAppointmentStatus
};
