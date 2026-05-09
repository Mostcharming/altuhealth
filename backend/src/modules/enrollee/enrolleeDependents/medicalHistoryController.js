'use strict';

const { Op } = require('sequelize');

async function listDependentMedicalHistory(req, res, next) {
    try {
        const { EnrolleeDependentMedicalHistory, Provider, Diagnosis, EnrolleeDependent } = req.models;
        const { dependentId } = req.params;
        const enrolleeId = req.user?.id;

        if (!enrolleeId) return res.fail('Enrollee ID is required', 400);
        if (!dependentId) return res.fail('Dependent ID is required', 400);

        // Verify the dependent belongs to this enrollee
        const dependent = await EnrolleeDependent.findOne({
            where: { id: dependentId, enrolleeId }
        });

        if (!dependent) return res.fail('Dependent not found', 403);

        const { limit = 10, page = 1, q, status } = req.query;

        const isAll = String(limit).toLowerCase() === 'all';
        const limitNum = isAll ? 0 : Number(limit);
        const pageNum = isAll ? 1 : (Number(page) || 1);
        const offset = isAll ? 0 : (pageNum - 1) * limitNum;

        const where = {
            enrolleeDependentId: dependentId
        };

        if (status) {
            where.status = status;
        }

        if (q) {
            where[Op.or] = [
                { notes: { [Op.iLike || Op.like]: `%${q}%` } },
                { evsCode: { [Op.iLike || Op.like]: `%${q}%` } }
            ];
        }

        const total = await EnrolleeDependentMedicalHistory.count({ where });

        const findOptions = {
            where,
            order: [['serviceDate', 'DESC']],
            include: [
                {
                    model: Provider,
                    attributes: ['id', 'name', 'code', 'category', 'status', 'email', 'phoneNumber', 'state', 'lga', 'address'],
                    required: false
                },
                {
                    model: Diagnosis,
                    attributes: ['id', 'name', 'description', 'severity'],
                    required: false
                }
            ]
        };

        if (!isAll) {
            findOptions.limit = limitNum;
            findOptions.offset = Number(offset);
        }

        const histories = await EnrolleeDependentMedicalHistory.findAll(findOptions);
        const data = histories.map(h => h.toJSON());

        const hasPrevPage = !isAll && pageNum > 1;
        const hasNextPage = !isAll && (offset + histories.length < total);
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
        console.log('Error listing dependent medical history:', err);
        return next(err);
    }
}

async function createDependentMedicalHistory(req, res, next) {
    try {
        const { EnrolleeDependentMedicalHistory, EnrolleeDependent, Provider, Diagnosis } = req.models;
        const { dependentId } = req.params;
        const enrolleeId = req.user?.id;
        const { providerId, diagnosisId, evsCode, amount, serviceDate, notes, attachmentUrl, status } = req.body || {};

        if (!enrolleeId) return res.fail('Enrollee ID is required', 400);
        if (!dependentId) return res.fail('Dependent ID is required', 400);

        // Verify the dependent belongs to this enrollee
        const dependent = await EnrolleeDependent.findOne({
            where: { id: dependentId, enrolleeId }
        });

        if (!dependent) return res.fail('Dependent not found', 403);

        const history = await EnrolleeDependentMedicalHistory.create({
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

        return res.success({ history: history.toJSON() }, 'Medical history created successfully', 201);
    } catch (err) {
        console.log('Error creating medical history:', err);
        return next(err);
    }
}

module.exports = {
    listDependentMedicalHistory,
    createDependentMedicalHistory
};
