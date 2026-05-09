'use strict';

const { Op } = require('sequelize');

async function listMedicalHistory(req, res, next) {
    try {
        const { EnrolleeMedicalHistory, Provider, Diagnosis } = req.models;
        const enrolleeId = req.user?.id;

        if (!enrolleeId) return res.fail('Enrollee ID is required', 400);

        const { limit = 10, page = 1, q, status } = req.query;

        const isAll = String(limit).toLowerCase() === 'all';
        const limitNum = isAll ? 0 : Number(limit);
        const pageNum = isAll ? 1 : (Number(page) || 1);
        const offset = isAll ? 0 : (pageNum - 1) * limitNum;

        const where = {
            enrolleeId // Only show medical history for the current enrollee
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

        const total = await EnrolleeMedicalHistory.count({ where });

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

        const records = await EnrolleeMedicalHistory.findAll(findOptions);
        const data = records.map(record => record.toJSON());

        const hasPrevPage = !isAll && pageNum > 1;
        const hasNextPage = !isAll && (offset + records.length < total);
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

async function getMedicalHistory(req, res, next) {
    try {
        const { EnrolleeMedicalHistory, Provider, Diagnosis } = req.models;
        const { id } = req.params;
        const enrolleeId = req.user?.id;

        if (!enrolleeId) return res.fail('Enrollee ID is required', 400);

        const record = await EnrolleeMedicalHistory.findByPk(id, {
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
        });

        if (!record) return res.fail('Medical history record not found', 404);

        // Ensure enrollee can only see their own medical history
        if (record.enrolleeId !== enrolleeId) {
            return res.fail('Unauthorized access to this medical history record', 403);
        }

        return res.success(record.toJSON());
    } catch (err) {
        return next(err);
    }
}

module.exports = {
    listMedicalHistory,
    getMedicalHistory
};
