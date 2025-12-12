'use strict';

const { Op } = require('sequelize');
const { addAuditLog } = require('../../../utils/addAdminNotification');

async function createAdmissionRecord(req, res, next) {
    try {
        const { AdmissionTracker } = req.models;
        const {
            enrolleeId,
            providerId,
            companyId,
            subsidiaryId,
            admissionDate,
            diagnosis,
            diagnosisCode,
            roomType,
            bedNumber,
            ward,
            reasonForAdmission,
            admittingPhysician,
            notes
        } = req.body || {};

        if (!enrolleeId) return res.fail('`enrolleeId` is required', 400);
        if (!providerId) return res.fail('`providerId` is required', 400);
        if (!companyId) return res.fail('`companyId` is required', 400);
        if (!admissionDate) return res.fail('`admissionDate` is required', 400);

        const admission = await AdmissionTracker.create({
            enrolleeId,
            providerId,
            companyId,
            subsidiaryId,
            admissionDate,
            diagnosis,
            diagnosisCode,
            roomType,
            bedNumber,
            ward,
            reasonForAdmission,
            admittingPhysician,
            notes,
            status: 'admitted'
        });

        await addAuditLog(req.models, {
            action: 'admissionTracker.create',
            message: `Admission record created for enrollee`,
            userId: (req.user && req.user.id) ? req.user.id : null,
            userType: (req.user && req.user.type) ? req.user.type : null,
            meta: { admissionId: admission.id, enrolleeId, providerId, companyId }
        });

        return res.success({ admission: admission.toJSON() }, 'Admission record created', 201);
    } catch (err) {
        return next(err);
    }
}

async function updateAdmissionRecord(req, res, next) {
    try {
        const { AdmissionTracker } = req.models;
        const { id } = req.params;
        const {
            diagnosis,
            diagnosisCode,
            roomType,
            bedNumber,
            ward,
            reasonForAdmission,
            treatmentNotes,
            admittingPhysician,
            notes
        } = req.body || {};

        const admission = await AdmissionTracker.findByPk(id);
        if (!admission) return res.fail('Admission record not found', 404);

        const updates = {};
        if (diagnosis !== undefined) updates.diagnosis = diagnosis;
        if (diagnosisCode !== undefined) updates.diagnosisCode = diagnosisCode;
        if (roomType !== undefined) updates.roomType = roomType;
        if (bedNumber !== undefined) updates.bedNumber = bedNumber;
        if (ward !== undefined) updates.ward = ward;
        if (reasonForAdmission !== undefined) updates.reasonForAdmission = reasonForAdmission;
        if (treatmentNotes !== undefined) updates.treatmentNotes = treatmentNotes;
        if (admittingPhysician !== undefined) updates.admittingPhysician = admittingPhysician;
        if (notes !== undefined) updates.notes = notes;

        await admission.update(updates);

        await addAuditLog(req.models, {
            action: 'admissionTracker.update',
            message: `Admission record updated`,
            userId: (req.user && req.user.id) ? req.user.id : null,
            userType: (req.user && req.user.type) ? req.user.type : null,
            meta: { admissionId: admission.id }
        });

        return res.success({ admission }, 'Admission record updated');
    } catch (err) {
        return next(err);
    }
}

async function deleteAdmissionRecord(req, res, next) {
    try {
        const { AdmissionTracker } = req.models;
        const { id } = req.params;

        const admission = await AdmissionTracker.findByPk(id);
        if (!admission) return res.fail('Admission record not found', 404);

        await admission.destroy();

        await addAuditLog(req.models, {
            action: 'admissionTracker.delete',
            message: `Admission record deleted`,
            userId: (req.user && req.user.id) ? req.user.id : null,
            userType: (req.user && req.user.type) ? req.user.type : null,
            meta: { admissionId: id }
        });

        return res.success(null, 'Admission record deleted');
    } catch (err) {
        return next(err);
    }
}

async function listAdmissionRecords(req, res, next) {
    try {
        const { AdmissionTracker, Enrollee, Provider, Company, CompanySubsidiary } = req.models;
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
                { diagnosis: { [Op.iLike || Op.like]: `%${q}%` } },
                { diagnosisCode: { [Op.iLike || Op.like]: `%${q}%` } },
                { ward: { [Op.iLike || Op.like]: `%${q}%` } },
                { bedNumber: { [Op.iLike || Op.like]: `%${q}%` } }
            ];
        }

        const total = await AdmissionTracker.count({ where });

        const findOptions = {
            where,
            order: [['admissionDate', 'DESC']],
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

        const admissions = await AdmissionTracker.findAll(findOptions);
        const data = admissions.map(ad => ad.toJSON());

        const hasPrevPage = !isAll && pageNum > 1;
        const hasNextPage = !isAll && (offset + admissions.length < total);
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

async function getAdmissionRecord(req, res, next) {
    try {
        const { AdmissionTracker, Enrollee, Provider, Company, CompanySubsidiary, Admin } = req.models;
        const { id } = req.params;

        const admission = await AdmissionTracker.findByPk(id, {
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
                }
            ]
        });

        if (!admission) return res.fail('Admission record not found', 404);

        return res.success(admission.toJSON());
    } catch (err) {
        return next(err);
    }
}

async function dischargeAdmittedPatient(req, res, next) {
    try {
        const { AdmissionTracker } = req.models;
        const { id } = req.params;
        const { dischargeDate, dischargingPhysician, dischargeNotes } = req.body || {};

        if (!dischargeDate) return res.fail('`dischargeDate` is required', 400);

        const admission = await AdmissionTracker.findByPk(id);
        if (!admission) return res.fail('Admission record not found', 404);

        if (admission.status === 'discharged') {
            return res.fail('Patient is already discharged', 400);
        }

        // Calculate days of admission
        const daysOfAdmission = Math.ceil(
            (new Date(dischargeDate) - new Date(admission.admissionDate)) / (1000 * 60 * 60 * 24)
        );

        await admission.update({
            status: 'discharged',
            dischargeDate,
            dischargingPhysician,
            dischargeNotes,
            daysOfAdmission: daysOfAdmission > 0 ? daysOfAdmission : 0
        });

        await addAuditLog(req.models, {
            action: 'admissionTracker.discharge',
            message: `Patient discharged from admission`,
            userId: (req.user && req.user.id) ? req.user.id : null,
            userType: (req.user && req.user.type) ? req.user.type : null,
            meta: { admissionId: admission.id, daysOfAdmission }
        });

        return res.success({ admission }, 'Patient discharged successfully');
    } catch (err) {
        return next(err);
    }
}

async function transferPatient(req, res, next) {
    try {
        const { AdmissionTracker } = req.models;
        const { id } = req.params;

        const admission = await AdmissionTracker.findByPk(id);
        if (!admission) return res.fail('Admission record not found', 404);

        if (admission.status === 'transferred') {
            return res.fail('Patient is already transferred', 400);
        }

        await admission.update({
            status: 'transferred'
        });

        await addAuditLog(req.models, {
            action: 'admissionTracker.transfer',
            message: `Patient transferred from admission`,
            userId: (req.user && req.user.id) ? req.user.id : null,
            userType: (req.user && req.user.type) ? req.user.type : null,
            meta: { admissionId: admission.id }
        });

        return res.success({ admission }, 'Patient transferred successfully');
    } catch (err) {
        return next(err);
    }
}

async function markPatientExpired(req, res, next) {
    try {
        const { AdmissionTracker } = req.models;
        const { id } = req.params;
        const { dischargeDate, dischargeNotes } = req.body || {};

        const admission = await AdmissionTracker.findByPk(id);
        if (!admission) return res.fail('Admission record not found', 404);

        if (admission.status === 'expired') {
            return res.fail('Patient status is already marked as expired', 400);
        }

        const updates = { status: 'expired' };
        if (dischargeDate) {
            updates.dischargeDate = dischargeDate;
            const daysOfAdmission = Math.ceil(
                (new Date(dischargeDate) - new Date(admission.admissionDate)) / (1000 * 60 * 60 * 24)
            );
            updates.daysOfAdmission = daysOfAdmission > 0 ? daysOfAdmission : 0;
        }
        if (dischargeNotes) updates.dischargeNotes = dischargeNotes;

        await admission.update(updates);

        await addAuditLog(req.models, {
            action: 'admissionTracker.markExpired',
            message: `Patient marked as expired`,
            userId: (req.user && req.user.id) ? req.user.id : null,
            userType: (req.user && req.user.type) ? req.user.type : null,
            meta: { admissionId: admission.id }
        });

        return res.success({ admission }, 'Patient marked as expired');
    } catch (err) {
        return next(err);
    }
}

async function markPatientAbsconded(req, res, next) {
    try {
        const { AdmissionTracker } = req.models;
        const { id } = req.params;
        const { abscondeDate, notes } = req.body || {};

        const admission = await AdmissionTracker.findByPk(id);
        if (!admission) return res.fail('Admission record not found', 404);

        if (admission.status === 'absconded') {
            return res.fail('Patient status is already marked as absconded', 400);
        }

        const updates = { status: 'absconded' };
        if (abscondeDate) {
            updates.dischargeDate = abscondeDate;
            const daysOfAdmission = Math.ceil(
                (new Date(abscondeDate) - new Date(admission.admissionDate)) / (1000 * 60 * 60 * 24)
            );
            updates.daysOfAdmission = daysOfAdmission > 0 ? daysOfAdmission : 0;
        }
        if (notes) updates.notes = notes;

        await admission.update(updates);

        await addAuditLog(req.models, {
            action: 'admissionTracker.markAbsconded',
            message: `Patient marked as absconded`,
            userId: (req.user && req.user.id) ? req.user.id : null,
            userType: (req.user && req.user.type) ? req.user.type : null,
            meta: { admissionId: admission.id }
        });

        return res.success({ admission }, 'Patient marked as absconded');
    } catch (err) {
        return next(err);
    }
}

async function approveBillAmount(req, res, next) {
    try {
        const { AdmissionTracker } = req.models;
        const { id } = req.params;
        const { totalBillAmount, approvedAmount } = req.body || {};

        if (!totalBillAmount) return res.fail('`totalBillAmount` is required', 400);
        if (!approvedAmount) return res.fail('`approvedAmount` is required', 400);

        const admission = await AdmissionTracker.findByPk(id);
        if (!admission) return res.fail('Admission record not found', 404);

        await admission.update({
            totalBillAmount,
            approvedAmount,
            approvedBy: (req.user && req.user.id) ? req.user.id : null
        });

        await addAuditLog(req.models, {
            action: 'admissionTracker.approveBill',
            message: `Bill amount approved for admission`,
            userId: (req.user && req.user.id) ? req.user.id : null,
            userType: (req.user && req.user.type) ? req.user.type : null,
            meta: { admissionId: admission.id, totalBillAmount, approvedAmount }
        });

        return res.success({ admission }, 'Bill amount approved');
    } catch (err) {
        return next(err);
    }
}

module.exports = {
    createAdmissionRecord,
    updateAdmissionRecord,
    deleteAdmissionRecord,
    listAdmissionRecords,
    getAdmissionRecord,
    dischargeAdmittedPatient,
    transferPatient,
    markPatientExpired,
    markPatientAbsconded,
    approveBillAmount
};
