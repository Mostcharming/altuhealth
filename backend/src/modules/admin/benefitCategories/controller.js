const { Op } = require('sequelize');
const { addAuditLog } = require('../../../utils/addAdminNotification');
const { validateBenefitCategory } = require('../../../utils/benefitValidation');

async function createBenefitCategory(req, res, next) {
    try {
        const { BenefitCategory } = req.models;
        const { name } = req.body || {};

        // Validate input
        const validationErrors = validateBenefitCategory(req.body);
        if (validationErrors.length > 0) {
            return res.fail(validationErrors.join(', '), 400);
        }

        // Check if category name already exists
        const existingCategory = await BenefitCategory.findOne({ where: { name } });
        if (existingCategory) {
            return res.fail('Benefit category with this name already exists', 400);
        }

        const benefitCategory = await BenefitCategory.create({ name, count: 0 });

        await addAuditLog(req.models, {
            action: 'benefit_category.create',
            message: `Benefit category ${benefitCategory.name} created`,
            userId: (req.user && req.user.id) ? req.user.id : null,
            userType: (req.user && req.user.type) ? req.user.type : null,
            meta: { benefitCategoryId: benefitCategory.id }
        });

        return res.success(benefitCategory, 'Benefit category created successfully', 201);
    } catch (err) {
        return next(err);
    }
}

async function updateBenefitCategory(req, res, next) {
    try {
        const { BenefitCategory } = req.models;
        const { id } = req.params;
        const { name } = req.body || {};

        // Validate input
        const validationErrors = validateBenefitCategory(req.body);
        if (validationErrors.length > 0) {
            return res.fail(validationErrors.join(', '), 400);
        }

        const benefitCategory = await BenefitCategory.findByPk(id);
        if (!benefitCategory) return res.fail('Benefit category not found', 404);

        if (name) {
            // Check if another category with this name exists
            const existingCategory = await BenefitCategory.findOne({
                where: {
                    name,
                    id: { [Op.ne]: id }
                }
            });
            if (existingCategory) {
                return res.fail('Benefit category with this name already exists', 400);
            }
        }

        await benefitCategory.update({ name });

        await addAuditLog(req.models, {
            action: 'benefit_category.update',
            message: `Benefit category ${benefitCategory.name} updated`,
            userId: (req.user && req.user.id) ? req.user.id : null,
            userType: (req.user && req.user.type) ? req.user.type : null,
            meta: { benefitCategoryId: id }
        });

        return res.success(benefitCategory, 'Benefit category updated successfully');
    } catch (err) {
        return next(err);
    }
}

async function deleteBenefitCategory(req, res, next) {
    try {
        const { BenefitCategory, Benefit } = req.models;
        const { id } = req.params;

        const benefitCategory = await BenefitCategory.findByPk(id);
        if (!benefitCategory) return res.fail('Benefit category not found', 404);

        // Check if category has benefits
        const benefitCount = await Benefit.count({ where: { benefitCategoryId: id } });
        if (benefitCount > 0) {
            return res.fail('Cannot delete benefit category that has benefits. Please remove all benefits from this category first.', 400);
        }

        await benefitCategory.destroy();

        await addAuditLog(req.models, {
            action: 'benefit_category.delete',
            message: `Benefit category ${benefitCategory.name} deleted`,
            userId: (req.user && req.user.id) ? req.user.id : null,
            userType: (req.user && req.user.type) ? req.user.type : null,
            meta: { benefitCategoryId: id }
        });

        return res.success(null, 'Benefit category deleted successfully');
    } catch (err) {
        return next(err);
    }
}

async function listBenefitCategories(req, res, next) {
    try {
        const { BenefitCategory, Benefit } = req.models;
        const { limit = 10, page = 1, q, includeBenefits = false } = req.query;

        // if client passes limit=all (case-insensitive), return all results without pagination
        const isAll = String(limit).toLowerCase() === 'all';
        const limitNum = isAll ? 0 : Number(limit);
        const pageNum = isAll ? 1 : (Number(page) || 1);
        const offset = isAll ? 0 : (pageNum - 1) * limitNum;

        const where = {};
        if (q) {
            where.name = { [Op.iLike || Op.like]: `%${q}%` };
        }

        // total count for pagination
        const total = await BenefitCategory.count({ where });

        const findOptions = {
            where,
            order: [['created_at', 'DESC']]
        };

        if (!isAll) {
            findOptions.limit = limitNum;
            findOptions.offset = Number(offset);
        }

        const benefitCategories = await BenefitCategory.findAll(findOptions);

        let data = benefitCategories.map(bc => bc.toJSON());

        // Include benefits if requested
        if (String(includeBenefits).toLowerCase() === 'true') {
            const categoryIds = benefitCategories.map(bc => bc.id);
            if (categoryIds.length) {
                const benefits = await Benefit.findAll({
                    where: { benefitCategoryId: { [Op.in]: categoryIds } },
                    order: [['created_at', 'DESC']]
                });

                const benefitMap = benefits.reduce((acc, benefit) => {
                    acc[benefit.benefitCategoryId] = acc[benefit.benefitCategoryId] || [];
                    acc[benefit.benefitCategoryId].push(benefit);
                    return acc;
                }, {});

                data = data.map(bc => ({
                    ...bc,
                    benefits: benefitMap[bc.id] || []
                }));
            }
        }

        const hasPrevPage = !isAll && pageNum > 1;
        const hasNextPage = !isAll && (offset + benefitCategories.length < total);
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

async function getBenefitCategory(req, res, next) {
    try {
        const { BenefitCategory, Benefit } = req.models;
        const { id } = req.params;
        const { includeBenefits = false } = req.query;

        const benefitCategory = await BenefitCategory.findByPk(id);
        if (!benefitCategory) return res.fail('Benefit category not found', 404);

        let result = benefitCategory.toJSON();

        // Include benefits if requested
        if (String(includeBenefits).toLowerCase() === 'true') {
            const benefits = await Benefit.findAll({
                where: { benefitCategoryId: id },
                order: [['created_at', 'DESC']]
            });
            result.benefits = benefits;
        }

        return res.success(result);
    } catch (err) {
        return next(err);
    }
}

module.exports = {
    createBenefitCategory,
    updateBenefitCategory,
    deleteBenefitCategory,
    listBenefitCategories,
    getBenefitCategory,
};
