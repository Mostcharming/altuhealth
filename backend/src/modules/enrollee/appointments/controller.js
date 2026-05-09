'use strict';

const { Op } = require('sequelize');
const { addProviderNotification } = require('../../../utils/addNotifications');
const notify = require('../../../utils/notify');

async function createAppointment(req, res, next) {
    try {
        const { Appointment, Enrollee, Provider } = req.models;
        const enrolleeId = req.user?.id;

        if (!enrolleeId) return res.fail('Enrollee ID is required', 400);

        const {
            providerId,
            complaint,
            appointmentDateTime,
            notes
        } = req.body || {};

        if (!providerId) return res.fail('`providerId` is required', 400);
        if (!appointmentDateTime) return res.fail('`appointmentDateTime` is required', 400);

        const appointment = await Appointment.create({
            enrolleeId,
            providerId,
            complaint,
            appointmentDateTime,
            notes,
            status: 'pending'
        });

        // Fetch enrollee and provider details for notifications (non-blocking)
        try {
            const enrollee = await Enrollee.findByPk(enrolleeId);
            const provider = await Provider.findByPk(providerId);

            if (enrollee && provider) {
                // Format appointment date time for display
                const appointmentDate = new Date(appointmentDateTime);
                const formattedDateTime = appointmentDate.toLocaleString('en-US', {
                    weekday: 'short',
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit'
                });

                // Create provider in-app notification
                await addProviderNotification(req.models, {
                    providerId,
                    title: `New Appointment Request from ${enrollee.firstName} ${enrollee.lastName}`,
                    message: `Patient: ${enrollee.firstName} ${enrollee.lastName}\nDate: ${formattedDateTime}\nReason: ${complaint || 'No reason specified'}`,
                    clickUrl: 'appointments',
                    notificationType: 'appointment_request'
                });

                // Send email notification to provider
                await notify(
                    provider,
                    'Provider',
                    'APPOINTMENT_CREATED',
                    {
                        enrolleeName: `${enrollee.firstName} ${enrollee.lastName}`,
                        providerName: provider.name,
                        appointmentDateTime: formattedDateTime,
                        complaint: complaint || 'No complaint specified',
                        notes: notes || 'No additional notes',
                        providerPortalLink: `${process.env.FE_PROVIDER_URL || 'https://provider.altuhealth.com'}/appointments`
                    },
                    ['email'],
                    true
                );
            }
        } catch (notifErr) {
            // Log notification error but don't block appointment creation
            console.error('Error sending appointment notifications:', notifErr);
        }

        return res.success({ appointment: appointment.toJSON() }, 'Appointment created', 201);
    } catch (err) {
        console.log('Error creating appointment:', err);
        return next(err);
    }
}

async function listAppointments(req, res, next) {
    try {
        const { Appointment, Enrollee, Provider, Company, CompanySubsidiary } = req.models;
        const enrolleeId = req.user?.id;

        if (!enrolleeId) return res.fail('Enrollee ID is required', 400);

        const { limit = 10, page = 1, q, status } = req.query;

        const isAll = String(limit).toLowerCase() === 'all';
        const limitNum = isAll ? 0 : Number(limit);
        const pageNum = isAll ? 1 : (Number(page) || 1);
        const offset = isAll ? 0 : (pageNum - 1) * limitNum;

        const where = {
            enrolleeId // Only show appointments for the current enrollee
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
                    model: Provider,
                    attributes: ['id', 'name', 'code', 'category', 'status', 'email', 'phoneNumber', 'state', 'lga', 'address'],
                    required: false
                },
                {
                    model: Company,
                    attributes: ['id', 'name', 'email', 'phoneNumber', 'isActive'],
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
        const { Appointment, Provider, Company, CompanySubsidiary } = req.models;
        const { id } = req.params;
        const enrolleeId = req.user?.id;

        if (!enrolleeId) return res.fail('Enrollee ID is required', 400);

        const appointment = await Appointment.findByPk(id, {
            include: [
                {
                    model: Provider,
                    attributes: ['id', 'name', 'code', 'category', 'status', 'email', 'phoneNumber', 'state', 'lga', 'address'],
                    required: false
                },
                {
                    model: Company,
                    attributes: ['id', 'name', 'email', 'phoneNumber', 'isActive'],
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

        // Ensure enrollee can only see their own appointments
        if (appointment.enrolleeId !== enrolleeId) {
            return res.fail('Unauthorized access to this appointment', 403);
        }

        return res.success(appointment.toJSON());
    } catch (err) {
        return next(err);
    }
}

async function updateAppointment(req, res, next) {
    try {
        const { Appointment } = req.models;
        const { id } = req.params;
        const enrolleeId = req.user?.id;

        if (!enrolleeId) return res.fail('Enrollee ID is required', 400);

        const appointment = await Appointment.findByPk(id);
        if (!appointment) return res.fail('Appointment not found', 404);

        // Ensure enrollee can only update their own appointments
        if (appointment.enrolleeId !== enrolleeId) {
            return res.fail('Unauthorized access to this appointment', 403);
        }

        // Enrollees can only update certain fields and only for pending appointments
        if (appointment.status !== 'pending') {
            return res.fail('Can only update pending appointments', 400);
        }

        const {
            providerId,
            companyId,
            subsidiaryId,
            complaint,
            appointmentDateTime,
            notes
        } = req.body || {};

        const updates = {};
        if (providerId !== undefined) updates.providerId = providerId;
        if (companyId !== undefined) updates.companyId = companyId;
        if (subsidiaryId !== undefined) updates.subsidiaryId = subsidiaryId;
        if (complaint !== undefined) updates.complaint = complaint;
        if (appointmentDateTime !== undefined) updates.appointmentDateTime = appointmentDateTime;
        if (notes !== undefined) updates.notes = notes;

        await appointment.update(updates);

        return res.success({ appointment: appointment.toJSON() }, 'Appointment updated');
    } catch (err) {
        return next(err);
    }
}

async function cancelAppointment(req, res, next) {
    try {
        const { Appointment, Enrollee, Provider } = req.models;
        const { id } = req.params;
        const enrolleeId = req.user?.id;

        if (!enrolleeId) return res.fail('Enrollee ID is required', 400);

        const appointment = await Appointment.findByPk(id);
        if (!appointment) return res.fail('Appointment not found', 404);

        // Ensure enrollee can only cancel their own appointments
        if (appointment.enrolleeId !== enrolleeId) {
            return res.fail('Unauthorized access to this appointment', 403);
        }

        // Can only cancel if not already cancelled or attended
        if (['cancelled', 'attended'].includes(appointment.status)) {
            return res.fail(`Cannot cancel a ${appointment.status} appointment`, 400);
        }

        await appointment.update({
            status: 'cancelled'
        });

        // Send notifications to provider (non-blocking)
        try {
            const enrollee = await Enrollee.findByPk(enrolleeId);
            const provider = await Provider.findByPk(appointment.providerId);

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

                // Create provider in-app notification
                const { addProviderNotification } = require('../../../utils/addNotifications');
                await addProviderNotification(req.models, {
                    providerId: appointment.providerId,
                    title: `Appointment Cancelled by ${enrollee.firstName} ${enrollee.lastName}`,
                    message: `Patient: ${enrollee.firstName} ${enrollee.lastName}\nScheduled Date: ${formattedDateTime}\nStatus: Cancelled`,
                    clickUrl: 'appointments',
                    notificationType: 'appointment_cancelled'
                });

                // Send email notification to provider
                await notify(
                    provider,
                    'Provider',
                    'APPOINTMENT_CANCELLED_BY_ENROLLEE',
                    {
                        enrolleeName: `${enrollee.firstName} ${enrollee.lastName}`,
                        providerName: provider.name,
                        appointmentDateTime: formattedDateTime,
                        providerPortalLink: `${process.env.FE_PROVIDER_URL || 'https://provider.altuhealth.com'}/appointments`
                    },
                    ['email'],
                    true
                );
            }
        } catch (notifErr) {
            console.error('Error sending appointment cancellation notifications:', notifErr);
        }

        return res.success({ appointment }, 'Appointment cancelled');
    } catch (err) {
        return next(err);
    }
}

module.exports = {
    createAppointment,
    listAppointments,
    getAppointment,
    updateAppointment,
    cancelAppointment
};
