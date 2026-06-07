'use strict';

const { Op } = require('sequelize');

function getPagination(query) {
    const { limit = 10, page = 1 } = query;
    const isAll = String(limit).toLowerCase() === 'all';
    const limitNum = isAll ? 0 : Number(limit);
    const pageNum = isAll ? 1 : (Number(page) || 1);
    const offset = isAll ? 0 : (pageNum - 1) * limitNum;

    return { isAll, limitNum, pageNum, offset };
}

function paginatedResponse({ rows, total, isAll, limitNum, pageNum, offset }) {
    const hasPrevPage = !isAll && pageNum > 1;
    const hasNextPage = !isAll && (offset + rows.length < total);
    const totalPages = isAll ? 1 : (limitNum > 0 ? Math.ceil(total / limitNum) : 1);

    return {
        list: rows.map((row) => row.toJSON()),
        count: total,
        page: pageNum,
        limit: isAll ? 'all' : limitNum,
        totalPages,
        hasNextPage,
        hasPrevPage
    };
}

async function listDrugs(req, res, next) {
    try {
        const { Drug } = req.models;
        const providerId = req.user?.id;

        if (!providerId) return res.fail('Provider ID is required', 400);

        const { q, status } = req.query;
        const { isAll, limitNum, pageNum, offset } = getPagination(req.query);
        const where = { providerId };

        if (q) {
            where[Op.or] = [
                { name: { [Op.iLike || Op.like]: `%${q}%` } },
                { unit: { [Op.iLike || Op.like]: `%${q}%` } },
                { strength: { [Op.iLike || Op.like]: `%${q}%` } },
                { description: { [Op.iLike || Op.like]: `%${q}%` } }
            ];
        }

        if (status) where.status = status;

        const total = await Drug.count({ where });
        const findOptions = {
            where,
            order: [['created_at', 'DESC']]
        };

        if (!isAll) {
            findOptions.limit = limitNum;
            findOptions.offset = Number(offset);
        }

        const drugs = await Drug.findAll(findOptions);

        return res.success(paginatedResponse({
            rows: drugs,
            total,
            isAll,
            limitNum,
            pageNum,
            offset
        }));
    } catch (err) {
        return next(err);
    }
}

async function listServices(req, res, next) {
    try {
        const { Service } = req.models;
        const providerId = req.user?.id;

        if (!providerId) return res.fail('Provider ID is required', 400);

        const { q, status } = req.query;
        const { isAll, limitNum, pageNum, offset } = getPagination(req.query);
        const where = { providerId };

        if (q) {
            where[Op.or] = [
                { name: { [Op.iLike || Op.like]: `%${q}%` } },
                { code: { [Op.iLike || Op.like]: `%${q}%` } },
                { description: { [Op.iLike || Op.like]: `%${q}%` } }
            ];
        }

        if (status) where.status = status;

        const total = await Service.count({ where });
        const findOptions = {
            where,
            order: [['created_at', 'DESC']]
        };

        if (!isAll) {
            findOptions.limit = limitNum;
            findOptions.offset = Number(offset);
        }

        const services = await Service.findAll(findOptions);

        return res.success(paginatedResponse({
            rows: services,
            total,
            isAll,
            limitNum,
            pageNum,
            offset
        }));
    } catch (err) {
        return next(err);
    }
}

module.exports = {
    listDrugs,
    listServices
};
