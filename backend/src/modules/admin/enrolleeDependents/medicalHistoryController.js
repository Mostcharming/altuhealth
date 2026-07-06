const { Op } = require('sequelize');
const { addAuditLog } = require('../../../utils/addAdminNotification');

async function createMedicalHistory(req, res, next) {
    try {
        const { EnrolleeDependentMedicalHistory, EnrolleeDependent, Provider, Diagnosis } = req.models;
        const { dependentId } = req.params;
        const { providerId, diagnosisId, evsCode, amount, serviceDate, notes, attachmentUrl, status } = req.body || {};

        if (!dependentId) return res.fail('`dependentId` is required', 400);

        // Verify dependent exists
        const dependent = await EnrolleeDependent.findByPk(dependentId);
        if (!dependent) return res.fail('Dependent not found', 404);

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
        const medicalHistory = await EnrolleeDependentMedicalHistory.create({
            enrolleeDependentId: dependentId,
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
            action: 'dependentMedicalHistory.created',
            message: `Created medical history for dependent ${dependentId}`,
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
        const { EnrolleeDependentMedicalHistory, Provider, Diagnosis } = req.models;
        const { dependentId } = req.params;
        const { page = 1, limit = 10, status = null } = req.query;

        if (!dependentId) return res.fail('`dependentId` is required', 400);

        const offset = (page - 1) * limit;
        const where = { enrolleeDependentId: dependentId };

        if (status) {
            where.status = status;
        }

        const { count, rows } = await EnrolleeDependentMedicalHistory.findAndCountAll({
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
        const { EnrolleeDependentMedicalHistory, EnrolleeDependent } = req.models;
        const { dependentId, medicalHistoryId } = req.params;
        const { providerId, diagnosisId, evsCode, amount, serviceDate, notes, attachmentUrl, status } = req.body || {};

        if (!dependentId) return res.fail('`dependentId` is required', 400);
        if (!medicalHistoryId) return res.fail('`medicalHistoryId` is required', 400);

        // Verify dependent exists
        const dependent = await EnrolleeDependent.findByPk(dependentId);
        if (!dependent) return res.fail('Dependent not found', 404);

        // Find medical history record
        const medicalHistory = await EnrolleeDependentMedicalHistory.findOne({
            where: { id: medicalHistoryId, enrolleeDependentId: dependentId }
        });

        if (!medicalHistory) return res.fail('Medical history record not found', 404);

        // Update the record
        await medicalHistory.update({
            providerId: providerId !== undefined ? providerId : medicalHistory.providerId,
            diagnosisId: diagnosisId !== undefined ? diagnosisId : medicalHistory.diagnosisId,
            evsCode: evsCode !== undefined ? evsCode : medicalHistory.evsCode,
            amount: amount !== undefined ? amount : medicalHistory.amount,
            serviceDate: serviceDate !== undefined ? serviceDate : medicalHistory.serviceDate,
            notes: notes !== undefined ? notes : medicalHistory.notes,
            attachmentUrl: attachmentUrl !== undefined ? attachmentUrl : medicalHistory.attachmentUrl,
            status: status !== undefined ? status : medicalHistory.status
        });

        // Add audit log
        await addAuditLog(req.models, {
            action: 'dependentMedicalHistory.updated',
            message: `Updated medical history for dependent ${dependentId}`,
            userId: req.user?.id,
            userType: 'admin'
        });

        return res.success(
            { medicalHistory },
            'Medical history record updated successfully'
        );
    } catch (error) {
        console.error('Error updating medical history:', error);
        next(error);
    }
}

async function deleteMedicalHistory(req, res, next) {
    try {
        const { EnrolleeDependentMedicalHistory, EnrolleeDependent } = req.models;
        const { dependentId, medicalHistoryId } = req.params;

        if (!dependentId) return res.fail('`dependentId` is required', 400);
        if (!medicalHistoryId) return res.fail('`medicalHistoryId` is required', 400);

        // Verify dependent exists
        const dependent = await EnrolleeDependent.findByPk(dependentId);
        if (!dependent) return res.fail('Dependent not found', 404);

        // Find and delete medical history record
        const medicalHistory = await EnrolleeDependentMedicalHistory.findOne({
            where: { id: medicalHistoryId, enrolleeDependentId: dependentId }
        });

        if (!medicalHistory) return res.fail('Medical history record not found', 404);

        await medicalHistory.destroy();

        // Add audit log
        await addAuditLog(req.models, {
            action: 'dependentMedicalHistory.deleted',
            message: `Deleted medical history for dependent ${dependentId}`,
            userId: req.user?.id,
            userType: 'admin'
        });

        return res.success(
            { medicalHistory },
            'Medical history record deleted successfully'
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
