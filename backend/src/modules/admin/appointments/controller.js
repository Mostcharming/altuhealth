'use strict';

const { Op } = require('sequelize');
const { addAuditLog } = require('../../../utils/addAdminNotification');

async function createAppointment(req, res, next) {
    try {
        const { Appointment } = req.models;
        const {
            enrolleeId,
            providerId,
            companyId,
            subsidiaryId,
            complaint,
            appointmentDateTime,
            notes
        } = req.body || {};

        if (!enrolleeId) return res.fail('`enrolleeId` is required', 400);
        if (!providerId) return res.fail('`providerId` is required', 400);
        if (!companyId) return res.fail('`companyId` is required', 400);
        if (!appointmentDateTime) return res.fail('`appointmentDateTime` is required', 400);

        const appointment = await Appointment.create({
            enrolleeId,
            providerId,
            companyId,
            subsidiaryId,
            complaint,
            appointmentDateTime,
            notes,
            status: 'pending'
        });

        await addAuditLog(req.models, {
            action: 'appointment.create',
            message: `Appointment created for enrollee`,
            userId: (req.user && req.user.id) ? req.user.id : null,
            userType: (req.user && req.user.type) ? req.user.type : null,
            meta: { appointmentId: appointment.id, enrolleeId, providerId, companyId }
        });

        return res.success({ appointment: appointment.toJSON() }, 'Appointment created', 201);
    } catch (err) {
        return next(err);
    }
}

async function updateAppointment(req, res, next) {
    try {
        const { Appointment } = req.models;
        const { id } = req.params;
        const {
            enrolleeId,
            providerId,
            companyId,
            subsidiaryId,
            complaint,
            appointmentDateTime,
            notes,
            status
        } = req.body || {};

        const appointment = await Appointment.findByPk(id);
        if (!appointment) return res.fail('Appointment not found', 404);

        const updates = {};
        if (enrolleeId !== undefined) updates.enrolleeId = enrolleeId;
        if (providerId !== undefined) updates.providerId = providerId;
        if (companyId !== undefined) updates.companyId = companyId;
        if (subsidiaryId !== undefined) updates.subsidiaryId = subsidiaryId;
        if (complaint !== undefined) updates.complaint = complaint;
        if (appointmentDateTime !== undefined) updates.appointmentDateTime = appointmentDateTime;
        if (notes !== undefined) updates.notes = notes;
        if (status !== undefined) updates.status = status;

        await appointment.update(updates);

        await addAuditLog(req.models, {
            action: 'appointment.update',
            message: `Appointment updated`,
            userId: (req.user && req.user.id) ? req.user.id : null,
            userType: (req.user && req.user.type) ? req.user.type : null,
            meta: { appointmentId: appointment.id }
        });

        return res.success({ appointment }, 'Appointment updated');
    } catch (err) {
        return next(err);
    }
}

async function deleteAppointment(req, res, next) {
    try {
        const { Appointment } = req.models;
        const { id } = req.params;

        const appointment = await Appointment.findByPk(id);
        if (!appointment) return res.fail('Appointment not found', 404);

        await appointment.destroy();

        await addAuditLog(req.models, {
            action: 'appointment.delete',
            message: `Appointment deleted`,
            userId: (req.user && req.user.id) ? req.user.id : null,
            userType: (req.user && req.user.type) ? req.user.type : null,
            meta: { appointmentId: id }
        });

        return res.success(null, 'Appointment deleted');
    } catch (err) {
        return next(err);
    }
}

async function listAppointments(req, res, next) {
    try {
        const { Appointment, Enrollee, Provider, Company, CompanySubsidiary } = req.models;
        const { limit = 10, page = 1, q, enrolleeId, providerId, companyId, status } = req.query;

        const isAll = String(limit).toLowerCase() === 'all';
        const limitNum = isAll ? 0 : Number(limit);
        const pageNum = isAll ? 1 : (Number(page) || 1);
        const offset = isAll ? 0 : (pageNum - 1) * limitNum;

        const where = {};

        if (enrolleeId) {
            where.enrolleeId = enrolleeId;
        }

        if (providerId) {
            where.providerId = providerId;
        }

        if (companyId) {
            where.companyId = companyId;
        }

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
                    attributes: ['id', 'firstName', 'lastName', 'email'],
                    required: false
                },
                {
                    model: Provider,
                    attributes: ['id', 'firstName', 'lastName', 'email'],
                    required: false
                },
                {
                    model: Company,
                    attributes: ['id', 'name', 'email'],
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
        const { Appointment, Enrollee, Provider, Company, CompanySubsidiary, Admin } = req.models;
        const { id } = req.params;

        const appointment = await Appointment.findByPk(id, {
            include: [
                {
                    model: Enrollee,
                    attributes: ['id', 'firstName', 'lastName', 'email', 'phoneNumber'],
                    required: false
                },
                {
                    model: Provider,
                    attributes: ['id', 'firstName', 'lastName', 'email', 'phoneNumber'],
                    required: false
                },
                {
                    model: Company,
                    attributes: ['id', 'name', 'email'],
                    required: false
                },
                {
                    model: CompanySubsidiary,
                    attributes: ['id', 'name'],
                    required: false,
                    as: 'subsidiary'
                },
                {
                    model: Admin,
                    attributes: ['id', 'firstName', 'lastName', 'email'],
                    as: 'approver',
                    required: false
                },
                {
                    model: Admin,
                    attributes: ['id', 'firstName', 'lastName', 'email'],
                    as: 'rejector',
                    required: false
                }
            ]
        });

        if (!appointment) return res.fail('Appointment not found', 404);

        return res.success(appointment.toJSON());
    } catch (err) {
        return next(err);
    }
}

async function approveAppointment(req, res, next) {
    try {
        const { Appointment } = req.models;
        const { id } = req.params;

        const appointment = await Appointment.findByPk(id);
        if (!appointment) return res.fail('Appointment not found', 404);

        if (appointment.status !== 'pending') {
            return res.fail('Only pending appointments can be approved', 400);
        }

        await appointment.update({
            status: 'approved',
            approvedBy: (req.user && req.user.id) ? req.user.id : null
        });

        await addAuditLog(req.models, {
            action: 'appointment.approve',
            message: `Appointment approved`,
            userId: (req.user && req.user.id) ? req.user.id : null,
            userType: (req.user && req.user.type) ? req.user.type : null,
            meta: { appointmentId: appointment.id }
        });

        return res.success({ appointment }, 'Appointment approved');
    } catch (err) {
        return next(err);
    }
}

async function rejectAppointment(req, res, next) {
    try {
        const { Appointment } = req.models;
        const { id } = req.params;
        const { rejectionReason } = req.body || {};

        const appointment = await Appointment.findByPk(id);
        if (!appointment) return res.fail('Appointment not found', 404);

        if (appointment.status !== 'pending') {
            return res.fail('Only pending appointments can be rejected', 400);
        }

        await appointment.update({
            status: 'rejected',
            rejectedBy: (req.user && req.user.id) ? req.user.id : null,
            rejectionReason
        });

        await addAuditLog(req.models, {
            action: 'appointment.reject',
            message: `Appointment rejected`,
            userId: (req.user && req.user.id) ? req.user.id : null,
            userType: (req.user && req.user.type) ? req.user.type : null,
            meta: { appointmentId: appointment.id }
        });

        return res.success({ appointment }, 'Appointment rejected');
    } catch (err) {
        return next(err);
    }
}

async function markAppointmentAttended(req, res, next) {
    try {
        const { Appointment } = req.models;
        const { id } = req.params;

        const appointment = await Appointment.findByPk(id);
        if (!appointment) return res.fail('Appointment not found', 404);

        await appointment.update({
            status: 'attended'
        });

        await addAuditLog(req.models, {
            action: 'appointment.markAttended',
            message: `Appointment marked as attended`,
            userId: (req.user && req.user.id) ? req.user.id : null,
            userType: (req.user && req.user.type) ? req.user.type : null,
            meta: { appointmentId: appointment.id }
        });

        return res.success({ appointment }, 'Appointment marked as attended');
    } catch (err) {
        return next(err);
    }
}

async function markAppointmentMissed(req, res, next) {
    try {
        const { Appointment } = req.models;
        const { id } = req.params;

        const appointment = await Appointment.findByPk(id);
        if (!appointment) return res.fail('Appointment not found', 404);

        await appointment.update({
            status: 'missed'
        });

        await addAuditLog(req.models, {
            action: 'appointment.markMissed',
            message: `Appointment marked as missed`,
            userId: (req.user && req.user.id) ? req.user.id : null,
            userType: (req.user && req.user.type) ? req.user.type : null,
            meta: { appointmentId: appointment.id }
        });

        return res.success({ appointment }, 'Appointment marked as missed');
    } catch (err) {
        return next(err);
    }
}

async function cancelAppointment(req, res, next) {
    try {
        const { Appointment } = req.models;
        const { id } = req.params;

        const appointment = await Appointment.findByPk(id);
        if (!appointment) return res.fail('Appointment not found', 404);

        await appointment.update({
            status: 'cancelled'
        });

        await addAuditLog(req.models, {
            action: 'appointment.cancel',
            message: `Appointment cancelled`,
            userId: (req.user && req.user.id) ? req.user.id : null,
            userType: (req.user && req.user.type) ? req.user.type : null,
            meta: { appointmentId: appointment.id }
        });

        return res.success({ appointment }, 'Appointment cancelled');
    } catch (err) {
        return next(err);
    }
}

async function rescheduleAppointment(req, res, next) {
    try {
        const { Appointment } = req.models;
        const { id } = req.params;
        const { appointmentDateTime } = req.body || {};

        if (!appointmentDateTime) return res.fail('`appointmentDateTime` is required', 400);

        const appointment = await Appointment.findByPk(id);
        if (!appointment) return res.fail('Appointment not found', 404);

        await appointment.update({
            appointmentDateTime,
            status: 'rescheduled'
        });

        await addAuditLog(req.models, {
            action: 'appointment.reschedule',
            message: `Appointment rescheduled`,
            userId: (req.user && req.user.id) ? req.user.id : null,
            userType: (req.user && req.user.type) ? req.user.type : null,
            meta: { appointmentId: appointment.id }
        });

        return res.success({ appointment }, 'Appointment rescheduled');
    } catch (err) {
        return next(err);
    }
}

module.exports = {
    createAppointment,
    updateAppointment,
    deleteAppointment,
    listAppointments,
    getAppointment,
    approveAppointment,
    rejectAppointment,
    markAppointmentAttended,
    markAppointmentMissed,
    cancelAppointment,
    rescheduleAppointment
};
