'use strict';

const { Op } = require('sequelize');
const { addAuditLog } = require('../../../utils/addAdminNotification');

async function createCompany(req, res, next) {
    try {
        const { Company } = req.models;
        const { name, email, phoneNumber } = req.body || {};

        if (!name) return res.fail('`name` is required', 400);
        if (!email) return res.fail('`email` is required', 400);

        // Check if email already exists
        const existingCompany = await Company.findOne({ where: { email } });
        if (existingCompany) return res.fail('Email already exists', 400);

        const company = await Company.create({ name, email, phoneNumber, isActive: true });

        await addAuditLog(req.models, {
            action: 'company.create',
            message: `Company ${company.name} created`,
            userId: (req.user && req.user.id) ? req.user.id : null,
            userType: (req.user && req.user.type) ? req.user.type : null,
            meta: { companyId: company.id }
        });

        return res.success({ company: company.toJSON() }, 'Company created', 201);
    } catch (err) {
        return next(err);
    }
}

async function updateCompany(req, res, next) {
    try {
        const { Company } = req.models;
        const { id } = req.params;
        const { name, email, phoneNumber, isActive } = req.body || {};

        const company = await Company.findByPk(id);
        if (!company) return res.fail('Company not found', 404);

        const updates = {};
        if (name !== undefined) updates.name = name;
        if (phoneNumber !== undefined) updates.phoneNumber = phoneNumber;
        if (isActive !== undefined) updates.isActive = isActive;

        if (email !== undefined) {
            // Check if email is unique (exclude current record)
            const other = await Company.findOne({
                where: { email, id: { [Op.ne]: id } }
            });
            if (other) return res.fail('Email already exists', 400);
            updates.email = email;
        }

        await company.update(updates);

        await addAuditLog(req.models, {
            action: 'company.update',
            message: `Company ${company.name} updated`,
            userId: (req.user && req.user.id) ? req.user.id : null,
            userType: (req.user && req.user.type) ? req.user.type : null,
            meta: { companyId: company.id }
        });

        return res.success({ company }, 'Company updated');
    } catch (err) {
        return next(err);
    }
}

async function deleteCompany(req, res, next) {
    try {
        const { Company } = req.models;
        const { id } = req.params;

        const company = await Company.findByPk(id);
        if (!company) return res.fail('Company not found', 404);

        await company.destroy();

        await addAuditLog(req.models, {
            action: 'company.delete',
            message: `Company ${company.name} deleted`,
            userId: (req.user && req.user.id) ? req.user.id : null,
            userType: (req.user && req.user.type) ? req.user.type : null,
            meta: { companyId: id }
        });

        return res.success(null, 'Company deleted');
    } catch (err) {
        return next(err);
    }
}

async function listCompanies(req, res, next) {
    try {
        const { Company } = req.models;
        const { limit = 10, page = 1, q, isActive } = req.query;

        const isAll = String(limit).toLowerCase() === 'all';
        const limitNum = isAll ? 0 : Number(limit);
        const pageNum = isAll ? 1 : (Number(page) || 1);
        const offset = isAll ? 0 : (pageNum - 1) * limitNum;

        const where = {};
        if (q) {
            where[Op.or] = [
                { name: { [Op.iLike || Op.like]: `%${q}%` } },
                { email: { [Op.iLike || Op.like]: `%${q}%` } },
                { phoneNumber: { [Op.iLike || Op.like]: `%${q}%` } }
            ];
        }

        if (isActive !== undefined) {
            where.isActive = isActive === 'true' || isActive === true;
        }

        const total = await Company.count({ where });

        const findOptions = {
            where,
            order: [['created_at', 'DESC']]
        };

        if (!isAll) {
            findOptions.limit = limitNum;
            findOptions.offset = Number(offset);
        }

        const companies = await Company.findAll(findOptions);
        const data = companies.map(c => c.toJSON());

        const hasPrevPage = !isAll && pageNum > 1;
        const hasNextPage = !isAll && (offset + companies.length < total);
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

async function getCompany(req, res, next) {
    try {
        const { Company } = req.models;
        const { id } = req.params;

        const company = await Company.findByPk(id);
        if (!company) return res.fail('Company not found', 404);

        return res.success(company.toJSON());
    } catch (err) {
        return next(err);
    }
}

module.exports = {
    createCompany,
    updateCompany,
    deleteCompany,
    listCompanies,
    getCompany
};
