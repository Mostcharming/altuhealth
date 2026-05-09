const { Op } = require('sequelize');
const { addAuditLog } = require('../../../utils/addAdminNotification');

async function createDiagnosis(req, res, next) {
    try {
        const { Diagnosis } = req.models;
        const { name, description, severity, symptoms, treatment, isChronicCondition } = req.body || {};

        if (!name) return res.fail('`name` is required', 400);

        // Validate severity if provided
        if (severity && !['mild', 'moderate', 'severe', 'critical'].includes(severity)) {
            return res.fail('Invalid `severity`. Must be one of: mild, moderate, severe, critical', 400);
        }

        const diagnosis = await Diagnosis.create({
            name,
            description,
            severity,
            symptoms,
            treatment,
            isChronicCondition: isChronicCondition || false
        });

        await addAuditLog(req.models, {
            action: 'diagnosis.create',
            message: `Diagnosis ${diagnosis.name} created`,
            userId: (req.user && req.user.id) ? req.user.id : null,
            userType: (req.user && req.user.type) ? req.user.type : null,
            meta: { diagnosisId: diagnosis.id }
        });

        return res.success({ diagnosis: diagnosis.toJSON() }, 'Diagnosis created', 201);
    } catch (err) {
        return next(err);
    }
}

async function updateDiagnosis(req, res, next) {
    try {
        const { Diagnosis } = req.models;
        const { id } = req.params;
        const { name, description, severity, symptoms, treatment, isChronicCondition } = req.body || {};

        const diagnosis = await Diagnosis.findByPk(id);
        if (!diagnosis) return res.fail('Diagnosis not found', 404);

        const updates = {};
        if (name !== undefined) updates.name = name;
        if (description !== undefined) updates.description = description;
        if (severity !== undefined) {
            if (severity && !['mild', 'moderate', 'severe', 'critical'].includes(severity)) {
                return res.fail('Invalid `severity`. Must be one of: mild, moderate, severe, critical', 400);
            }
            updates.severity = severity;
        }
        if (symptoms !== undefined) updates.symptoms = symptoms;
        if (treatment !== undefined) updates.treatment = treatment;
        if (isChronicCondition !== undefined) updates.isChronicCondition = isChronicCondition;

        await diagnosis.update(updates);

        await addAuditLog(req.models, {
            action: 'diagnosis.update',
            message: `Diagnosis ${diagnosis.name} updated`,
            userId: (req.user && req.user.id) ? req.user.id : null,
            userType: (req.user && req.user.type) ? req.user.type : null,
            meta: { diagnosisId: diagnosis.id }
        });

        return res.success({ diagnosis }, 'Diagnosis updated');
    } catch (err) {
        return next(err);
    }
}

async function deleteDiagnosis(req, res, next) {
    try {
        const { Diagnosis } = req.models;
        const { id } = req.params;

        const diagnosis = await Diagnosis.findByPk(id);
        if (!diagnosis) return res.fail('Diagnosis not found', 404);

        await diagnosis.destroy();

        await addAuditLog(req.models, {
            action: 'diagnosis.delete',
            message: `Diagnosis ${diagnosis.name} deleted`,
            userId: (req.user && req.user.id) ? req.user.id : null,
            userType: (req.user && req.user.type) ? req.user.type : null,
            meta: { diagnosisId: id }
        });

        return res.success(null, 'Diagnosis deleted');
    } catch (err) {
        return next(err);
    }
}

async function listDiagnoses(req, res, next) {
    try {
        const { Diagnosis } = req.models;
        const { limit = 10, page = 1, q, severity, isChronicCondition } = req.query;

        const isAll = String(limit).toLowerCase() === 'all';
        const limitNum = isAll ? 0 : Number(limit);
        const pageNum = isAll ? 1 : (Number(page) || 1);
        const offset = isAll ? 0 : (pageNum - 1) * limitNum;

        const where = {};

        // Search by name or description
        if (q) {
            where[Op.or] = [
                { name: { [Op.iLike || Op.like]: `%${q}%` } },
                { description: { [Op.iLike || Op.like]: `%${q}%` } }
            ];
        }

        // Filter by severity
        if (severity) {
            where.severity = severity;
        }

        // Filter by chronic condition status
        if (isChronicCondition !== undefined) {
            where.isChronicCondition = isChronicCondition === 'true';
        }

        const total = await Diagnosis.count({ where });

        const findOptions = {
            where,
            order: [['created_at', 'DESC']]
        };

        if (!isAll) {
            findOptions.limit = limitNum;
            findOptions.offset = Number(offset);
        }

        const diagnoses = await Diagnosis.findAll(findOptions);
        const data = diagnoses.map(d => d.toJSON());

        const hasPrevPage = !isAll && pageNum > 1;
        const hasNextPage = !isAll && (offset + diagnoses.length < total);
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

async function getDiagnosis(req, res, next) {
    try {
        const { Diagnosis } = req.models;
        const { id } = req.params;

        const diagnosis = await Diagnosis.findByPk(id);
        if (!diagnosis) return res.fail('Diagnosis not found', 404);

        return res.success(diagnosis.toJSON());
    } catch (err) {
        return next(err);
    }
}

async function getSeverityOptions(req, res, next) {
    try {
        const severityOptions = ['mild', 'moderate', 'severe', 'critical'];
        return res.success({ severityOptions });
    } catch (err) {
        return next(err);
    }
}

module.exports = {
    createDiagnosis,
    updateDiagnosis,
    deleteDiagnosis,
    listDiagnoses,
    getDiagnosis,
    getSeverityOptions
};
