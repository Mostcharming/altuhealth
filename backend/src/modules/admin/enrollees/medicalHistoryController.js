const { Op } = require('sequelize');
const { addAuditLog } = require('../../../utils/addAdminNotification');

async function createMedicalHistory(req, res, next) {
    try {
        const { EnrolleeMedicalHistory, Enrollee, Provider, Diagnosis } = req.models;
        const { enrolleeId } = req.params;
        const { providerId, diagnosisId, evsCode, amount, serviceDate, notes, attachmentUrl, status } = req.body || {};

        if (!enrolleeId) return res.fail('`enrolleeId` is required', 400);

        // Verify enrollee exists
        const enrollee = await Enrollee.findByPk(enrolleeId);
        if (!enrollee) return res.fail('Enrollee not found', 404);

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
        const medicalHistory = await EnrolleeMedicalHistory.create({
            enrolleeId,
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
            action: 'medicalHistory.created',
            message: `Created medical history for enrollee ${enrolleeId}`,
            userId: req.user?.id,
            userType: 'admin'
        });

        return res.success(
            { medicalHistory },
            'Medical history record created successfully',
            201
        );
    } catch (error) {
        console.error('Error creating medical history:', error);
        next(error);
    }
}

async function getMedicalHistories(req, res, next) {
    try {
        const { EnrolleeMedicalHistory, Provider, Diagnosis } = req.models;
        const { enrolleeId } = req.params;
        const { page = 1, limit = 10, status = null } = req.query;

        if (!enrolleeId) return res.fail('`enrolleeId` is required', 400);

        const offset = (page - 1) * limit;
        const where = { enrolleeId };

        if (status) {
            where.status = status;
        }

        const { count, rows } = await EnrolleeMedicalHistory.findAndCountAll({
            where,
            include: [
                { model: Provider, attributes: ['id', 'name', 'code'] },
                { model: Diagnosis, attributes: ['id', 'name'] }
            ],
            limit: parseInt(limit),
            offset: parseInt(offset),
            order: [['createdAt', 'DESC']],
            subQuery: false
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
    } catch (error) {
        console.error('Error fetching medical histories:', error);
        next(error);
    }
}

async function updateMedicalHistory(req, res, next) {
    try {
        const { EnrolleeMedicalHistory, Provider, Diagnosis } = req.models;
        const { enrolleeId, medicalHistoryId } = req.params;
        const updates = req.body || {};

        if (!enrolleeId) return res.fail('`enrolleeId` is required', 400);
        if (!medicalHistoryId) return res.fail('`medicalHistoryId` is required', 400);

        // Find medical history
        const medicalHistory = await EnrolleeMedicalHistory.findOne({
            where: { id: medicalHistoryId, enrolleeId }
        });
        if (!medicalHistory) return res.fail('Medical history not found', 404);

        // Verify provider exists if being updated
        if (updates.providerId && updates.providerId !== medicalHistory.providerId) {
            const provider = await Provider.findByPk(updates.providerId);
            if (!provider) return res.fail('Provider not found', 404);
        }

        // Verify diagnosis exists if being updated
        if (updates.diagnosisId && updates.diagnosisId !== medicalHistory.diagnosisId) {
            const diagnosis = await Diagnosis.findByPk(updates.diagnosisId);
            if (!diagnosis) return res.fail('Diagnosis not found', 404);
        }

        // Update medical history
        await medicalHistory.update(updates);

        // Add audit log
        await addAuditLog(req.models, {
            action: 'medicalHistory.updated',
            message: `Updated medical history for enrollee ${enrolleeId}`,
            userId: req.user?.id,
            userType: 'admin'
        });

        return res.success(
            { medicalHistory },
            'Medical history updated successfully'
        );
    } catch (error) {
        console.error('Error updating medical history:', error);
        next(error);
    }
}

async function deleteMedicalHistory(req, res, next) {
    try {
        const { EnrolleeMedicalHistory } = req.models;
        const { enrolleeId, medicalHistoryId } = req.params;

        if (!enrolleeId) return res.fail('`enrolleeId` is required', 400);
        if (!medicalHistoryId) return res.fail('`medicalHistoryId` is required', 400);

        // Find and delete medical history
        const medicalHistory = await EnrolleeMedicalHistory.findOne({
            where: { id: medicalHistoryId, enrolleeId }
        });
        if (!medicalHistory) return res.fail('Medical history not found', 404);

        await medicalHistory.destroy();

        // Add audit log
        await addAuditLog(req.models, {
            action: 'medicalHistory.deleted',
            message: `Deleted medical history for enrollee ${enrolleeId}`,
            userId: req.user?.id,
            userType: 'admin'
        });

        return res.success(
            null,
            'Medical history deleted successfully'
        );
    } catch (error) {
        console.error('Error deleting medical history:', error);
        next(error);
    }
}

module.exports = {
    createMedicalHistory,
    getMedicalHistories,
    updateMedicalHistory,
    deleteMedicalHistory
};
