'use strict';

const { Op } = require('sequelize');

function resolveDependentMedicalContext(req) {
    if (req.user?.type === 'RetailEnrollee') {
        return {
            parentModel: req.models.RetailEnrollee,
            dependentModel: req.models.RetailEnrolleeDependent,
            historyModel: req.models.RetailEnrolleeDependentMedicalHistory,
            dependentOwnerKey: 'retailEnrolleeId',
            historyDependentKey: 'retailEnrolleeDependentId',
            dependentAssociationKey: 'RetailEnrolleeDependent'
        };
    }

    if (req.user?.type === 'Enrollee') {
        return {
            parentModel: req.models.Enrollee,
            dependentModel: req.models.EnrolleeDependent,
            historyModel: req.models.EnrolleeDependentMedicalHistory,
            dependentOwnerKey: 'enrolleeId',
            historyDependentKey: 'enrolleeDependentId',
            dependentAssociationKey: 'EnrolleeDependent'
        };
    }

    return null;
}

async function requireDependentMedicalAccess(req, res) {
    const context = resolveDependentMedicalContext(req);
    const enrolleeId = req.user?.id;

    if (!context || !enrolleeId) {
        res.fail('Unsupported enrollee account type', 403);
        return null;
    }

    const enrollee = await context.parentModel.findByPk(enrolleeId, {
        attributes: ['id', 'dependentVisitNotificationsEnabled']
    });

    if (!enrollee) {
        res.fail('Enrollee not found', 404);
        return null;
    }

    if (enrollee.dependentVisitNotificationsEnabled !== true) {
        res.fail(
            'Dependent medical history is unavailable because dependent visit notifications are disabled',
            403
        );
        return null;
    }

    return { context, enrolleeId };
}

function parsePagination(query) {
    const { limit = 10, page = 1 } = query;
    const isAll = String(limit).toLowerCase() === 'all';
    const parsedLimit = Number(limit);
    const limitNum = isAll ? 0 : (Number.isFinite(parsedLimit) && parsedLimit > 0 ? parsedLimit : 10);
    const parsedPage = Number(page);
    const pageNum = isAll ? 1 : (Number.isFinite(parsedPage) && parsedPage > 0 ? parsedPage : 1);

    return {
        isAll,
        limitNum,
        pageNum,
        offset: isAll ? 0 : (pageNum - 1) * limitNum
    };
}

function buildHistoryInclude(req, context, includeDependent = false) {
    const include = [
        {
            model: req.models.Provider,
            attributes: ['id', 'name', 'code', 'category', 'status', 'email', 'phoneNumber', 'state', 'lga', 'address'],
            required: false
        },
        {
            model: req.models.Diagnosis,
            attributes: ['id', 'name', 'description', 'severity'],
            required: false
        }
    ];

    if (includeDependent) {
        include.push({
            model: context.dependentModel,
            attributes: ['id', 'firstName', 'middleName', 'lastName', 'policyNumber'],
            required: true
        });
    }

    return include;
}

function normalizeHistory(history, context) {
    const data = typeof history.toJSON === 'function' ? history.toJSON() : history;
    const dependent = data[context.dependentAssociationKey] || null;

    return {
        ...data,
        dependent,
        provider: data.Provider || data.provider || null,
        diagnosis: data.Diagnosis || data.diagnosis || null
    };
}

function buildHistoryWhere(query, context, dependentIds) {
    const { q, status, dependentId } = query;
    const where = {
        [context.historyDependentKey]: dependentId || { [Op.in]: dependentIds }
    };

    if (status) where.status = status;

    if (q) {
        where[Op.or] = [
            { notes: { [Op.iLike || Op.like]: `%${q}%` } },
            { evsCode: { [Op.iLike || Op.like]: `%${q}%` } }
        ];
    }

    return where;
}

async function listAllDependentMedicalHistory(req, res, next) {
    try {
        const access = await requireDependentMedicalAccess(req, res);
        if (!access) return;

        const { context, enrolleeId } = access;
        const dependents = await context.dependentModel.findAll({
            where: { [context.dependentOwnerKey]: enrolleeId },
            attributes: ['id']
        });
        const dependentIds = dependents.map((dependent) => dependent.id);

        if (req.query.dependentId && !dependentIds.includes(req.query.dependentId)) {
            return res.fail('Dependent not found', 403);
        }

        const pagination = parsePagination(req.query);
        const where = buildHistoryWhere(req.query, context, dependentIds);
        const findOptions = {
            where,
            include: buildHistoryInclude(req, context, true),
            order: [['serviceDate', 'DESC'], ['createdAt', 'DESC']],
            distinct: true
        };

        if (!pagination.isAll) {
            findOptions.limit = pagination.limitNum;
            findOptions.offset = pagination.offset;
        }

        const { count, rows } = await context.historyModel.findAndCountAll(findOptions);
        const total = typeof count === 'number' ? count : count.length;
        const totalPages = pagination.isAll ? 1 : Math.max(1, Math.ceil(total / pagination.limitNum));

        return res.success({
            list: rows.map((history) => normalizeHistory(history, context)),
            count: total,
            page: pagination.pageNum,
            limit: pagination.isAll ? 'all' : pagination.limitNum,
            totalPages,
            hasNextPage: !pagination.isAll && pagination.offset + rows.length < total,
            hasPrevPage: !pagination.isAll && pagination.pageNum > 1
        });
    } catch (err) {
        return next(err);
    }
}

async function listDependentMedicalHistory(req, res, next) {
    try {
        const access = await requireDependentMedicalAccess(req, res);
        if (!access) return;

        const { context, enrolleeId } = access;
        const { dependentId } = req.params;
        if (!dependentId) return res.fail('Dependent ID is required', 400);

        const dependent = await context.dependentModel.findOne({
            where: {
                id: dependentId,
                [context.dependentOwnerKey]: enrolleeId
            }
        });
        if (!dependent) return res.fail('Dependent not found', 403);

        const pagination = parsePagination(req.query);
        const where = buildHistoryWhere(
            { ...req.query, dependentId },
            context,
            [dependentId]
        );
        const findOptions = {
            where,
            order: [['serviceDate', 'DESC'], ['createdAt', 'DESC']],
            include: buildHistoryInclude(req, context)
        };

        if (!pagination.isAll) {
            findOptions.limit = pagination.limitNum;
            findOptions.offset = pagination.offset;
        }

        const { count, rows } = await context.historyModel.findAndCountAll(findOptions);
        const totalPages = pagination.isAll ? 1 : Math.max(1, Math.ceil(count / pagination.limitNum));

        return res.success({
            list: rows.map((history) => normalizeHistory(history, context)),
            count,
            page: pagination.pageNum,
            limit: pagination.isAll ? 'all' : pagination.limitNum,
            totalPages,
            hasNextPage: !pagination.isAll && pagination.offset + rows.length < count,
            hasPrevPage: !pagination.isAll && pagination.pageNum > 1
        });
    } catch (err) {
        return next(err);
    }
}

async function createDependentMedicalHistory(req, res, next) {
    try {
        const access = await requireDependentMedicalAccess(req, res);
        if (!access) return;

        const { context, enrolleeId } = access;
        const { dependentId } = req.params;
        const { providerId, diagnosisId, evsCode, amount, serviceDate, notes, attachmentUrl, status } = req.body || {};

        if (!dependentId) return res.fail('Dependent ID is required', 400);

        const dependent = await context.dependentModel.findOne({
            where: {
                id: dependentId,
                [context.dependentOwnerKey]: enrolleeId
            }
        });
        if (!dependent) return res.fail('Dependent not found', 403);

        const history = await context.historyModel.create({
            [context.historyDependentKey]: dependentId,
            providerId: providerId || null,
            diagnosisId: diagnosisId || null,
            evsCode: evsCode || null,
            amount: amount || null,
            serviceDate: serviceDate || null,
            notes: notes || null,
            attachmentUrl: attachmentUrl || null,
            status: status || 'pending'
        });

        return res.success({ history: normalizeHistory(history, context) }, 'Medical history created successfully', 201);
    } catch (err) {
        return next(err);
    }
}

module.exports = {
    listAllDependentMedicalHistory,
    listDependentMedicalHistory,
    createDependentMedicalHistory
};
