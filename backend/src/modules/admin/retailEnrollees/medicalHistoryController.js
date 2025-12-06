const { Op } = require('sequelize');
const { addAuditLog } = require('../../../utils/addAdminNotification');

async function createRetailEnrolleeMedicalHistory(req, res, next) {
    try {
        const { RetailEnrolleeMedicalHistory, RetailEnrollee, Provider, Diagnosis } = req.models;
        const { retailEnrolleeId } = req.params;
        const { providerId, diagnosisId, evsCode, amount, serviceDate, notes, attachmentUrl, status } = req.body || {};

        if (!retailEnrolleeId) return res.fail('`retailEnrolleeId` is required', 400);

        // Verify retail enrollee exists
        const enrollee = await RetailEnrollee.findByPk(retailEnrolleeId);
        if (!enrollee) return res.fail('Retail enrollee not found', 404);

        // Verify provider exists if provided
        if (providerId) {
            const provider = await Provider.findByPk(providerId);
            if (!provider) return res.fail('Provider not found', 404);
        }

        // Verify diagnosis exists if provided
        if (diagnosisId) {
            const diagnosis = await Diagnosis.findByPk(diagnosisId);
            if (!diagnosis) return res.fail('Diagnosis not found', 404);
        }

        // Create medical history record
        const medicalHistory = await RetailEnrolleeMedicalHistory.create({
            retailEnrolleeId,
            providerId: providerId || null,
            diagnosisId: diagnosisId || null,
            evsCode: evsCode || null,
            amount: amount || null,
            serviceDate: serviceDate || null,
            notes: notes || null,
            attachmentUrl: attachmentUrl || null,
            status: status || 'pending'
        });

        // Add audit log
        await addAuditLog(req.models, {
            action: 'retail_enrollee_medical_history.create',
            message: `Created medical history for retail enrollee ${retailEnrolleeId}`,
            userId: (req.user && req.user.id) ? req.user.id : null,
            userType: (req.user && req.user.type) ? req.user.type : null,
            meta: { medicalHistoryId: medicalHistory.id, retailEnrolleeId }
        });

        return res.success(
            { medicalHistory },
            'Medical history record created successfully',
            201
        );
    } catch (err) {
        return next(err);
    }
}

async function getRetailEnrolleeMedicalHistories(req, res, next) {
    try {
        const { RetailEnrolleeMedicalHistory, Provider, Diagnosis } = req.models;
        const { retailEnrolleeId } = req.params;
        const { page = 1, limit = 20, status, providerId, diagnosisId, sortBy = 'createdAt', sortOrder = 'DESC' } = req.query;

        const offset = (page - 1) * limit;
        const where = { retailEnrolleeId };

        if (status) where.status = status;
        if (providerId) where.providerId = providerId;
        if (diagnosisId) where.diagnosisId = diagnosisId;

        const { count, rows } = await RetailEnrolleeMedicalHistory.findAndCountAll({
            where,
            include: [
                { model: Provider, attributes: ['id', 'name', 'email'] },
                { model: Diagnosis, attributes: ['id', 'name', 'code'] }
            ],
            limit: parseInt(limit),
            offset,
            order: [[sortBy, sortOrder]],
            distinct: true
        });

        return res.success(
            {
                medicalHistories: rows,
                pagination: {
                    total: count,
                    page: parseInt(page),
                    limit: parseInt(limit),
                    pages: Math.ceil(count / limit)
                }
            },
            'Medical histories retrieved successfully'
        );
    } catch (err) {
        return next(err);
    }
}

async function getRetailEnrolleeMedicalHistoryById(req, res, next) {
    try {
        const { RetailEnrolleeMedicalHistory, Provider, Diagnosis } = req.models;
        const { retailEnrolleeId, medicalHistoryId } = req.params;

        const medicalHistory = await RetailEnrolleeMedicalHistory.findByPk(medicalHistoryId, {
            include: [
                { model: Provider, attributes: ['id', 'name', 'email'] },
                { model: Diagnosis, attributes: ['id', 'name', 'code'] }
            ]
        });

        if (!medicalHistory) return res.fail('Medical history not found', 404);

        if (medicalHistory.retailEnrolleeId !== retailEnrolleeId) {
            return res.fail('Medical history does not belong to the specified enrollee', 400);
        }

        return res.success({ medicalHistory }, 'Medical history retrieved successfully');
    } catch (err) {
        return next(err);
    }
}

async function updateRetailEnrolleeMedicalHistory(req, res, next) {
    try {
        const { RetailEnrolleeMedicalHistory, Provider, Diagnosis } = req.models;
        const { retailEnrolleeId, medicalHistoryId } = req.params;
        const { providerId, diagnosisId, evsCode, amount, serviceDate, notes, attachmentUrl, status } = req.body || {};

        const medicalHistory = await RetailEnrolleeMedicalHistory.findByPk(medicalHistoryId);
        if (!medicalHistory) return res.fail('Medical history not found', 404);

        if (medicalHistory.retailEnrolleeId !== retailEnrolleeId) {
            return res.fail('Medical history does not belong to the specified enrollee', 400);
        }

        // Verify provider exists if provided
        if (providerId && providerId !== medicalHistory.providerId) {
            const provider = await Provider.findByPk(providerId);
            if (!provider) return res.fail('Provider not found', 404);
        }

        // Verify diagnosis exists if provided
        if (diagnosisId && diagnosisId !== medicalHistory.diagnosisId) {
            const diagnosis = await Diagnosis.findByPk(diagnosisId);
            if (!diagnosis) return res.fail('Diagnosis not found', 404);
        }

        const updates = {};
        if (providerId !== undefined) updates.providerId = providerId || null;
        if (diagnosisId !== undefined) updates.diagnosisId = diagnosisId || null;
        if (evsCode !== undefined) updates.evsCode = evsCode || null;
        if (amount !== undefined) updates.amount = amount || null;
        if (serviceDate !== undefined) updates.serviceDate = serviceDate || null;
        if (notes !== undefined) updates.notes = notes || null;
        if (attachmentUrl !== undefined) updates.attachmentUrl = attachmentUrl || null;
        if (status !== undefined) updates.status = status;

        await medicalHistory.update(updates);

        // Add audit log
        await addAuditLog(req.models, {
            action: 'retail_enrollee_medical_history.update',
            message: `Updated medical history for retail enrollee ${retailEnrolleeId}`,
            userId: (req.user && req.user.id) ? req.user.id : null,
            userType: (req.user && req.user.type) ? req.user.type : null,
            meta: { medicalHistoryId, retailEnrolleeId }
        });

        return res.success({ medicalHistory }, 'Medical history updated successfully');
    } catch (err) {
        return next(err);
    }
}

async function deleteRetailEnrolleeMedicalHistory(req, res, next) {
    try {
        const { RetailEnrolleeMedicalHistory } = req.models;
        const { retailEnrolleeId, medicalHistoryId } = req.params;

        const medicalHistory = await RetailEnrolleeMedicalHistory.findByPk(medicalHistoryId);
        if (!medicalHistory) return res.fail('Medical history not found', 404);

        if (medicalHistory.retailEnrolleeId !== retailEnrolleeId) {
            return res.fail('Medical history does not belong to the specified enrollee', 400);
        }

        await medicalHistory.destroy();

        // Add audit log
        await addAuditLog(req.models, {
            action: 'retail_enrollee_medical_history.delete',
            message: `Deleted medical history for retail enrollee ${retailEnrolleeId}`,
            userId: (req.user && req.user.id) ? req.user.id : null,
            userType: (req.user && req.user.type) ? req.user.type : null,
            meta: { medicalHistoryId, retailEnrolleeId }
        });

        return res.success(null, 'Medical history deleted successfully');
    } catch (err) {
        return next(err);
    }
}

module.exports = {
    createRetailEnrolleeMedicalHistory,
    getRetailEnrolleeMedicalHistories,
    getRetailEnrolleeMedicalHistoryById,
    updateRetailEnrolleeMedicalHistory,
    deleteRetailEnrolleeMedicalHistory
};
