const { Op } = require('sequelize');
const { addAuditLog } = require('../../../utils/addAdminNotification');
const { validateBenefit, validateBenefitUpdate } = require('../../../utils/benefitValidation');

async function createBenefit(req, res, next) {
    try {
        const { Benefit, BenefitCategory } = req.models;
        const { name, description, limit, amount, benefitCategoryId } = req.body || {};

        // Validate input
        const validationErrors = validateBenefit(req.body);
        if (validationErrors.length > 0) {
            return res.fail(validationErrors.join(', '), 400);
        }

        // Validate benefit category exists
        const benefitCategory = await BenefitCategory.findByPk(benefitCategoryId);
        if (!benefitCategory) {
            return res.fail('Benefit category not found', 400);
        }

        // Check if benefit name already exists within the same category
        const existingBenefit = await Benefit.findOne({
            where: {
                name,
                benefitCategoryId
            }
        });
        if (existingBenefit) {
            return res.fail('Benefit with this name already exists in this category', 400);
        }

        const sequelize = Benefit.sequelize;

        let benefit;
        await sequelize.transaction(async (t) => {
            benefit = await Benefit.create({
                name,
                description,
                limit,
                amount,
                benefitCategoryId
            }, { transaction: t });

            // Update benefit category count
            await benefitCategory.increment('count', { transaction: t });
        });

        await addAuditLog(req.models, {
            action: 'benefit.create',
            message: `Benefit ${benefit.name} created in category ${benefitCategory.name}`,
            userId: (req.user && req.user.id) ? req.user.id : null,
            userType: (req.user && req.user.type) ? req.user.type : null,
            meta: { benefitId: benefit.id, benefitCategoryId }
        });

        // Include category in response
        const result = { ...benefit.toJSON(), benefitCategory };

        return res.success(result, 'Benefit created successfully', 201);
    } catch (err) {
        return next(err);
    }
}

async function updateBenefit(req, res, next) {
    try {
        const { Benefit, BenefitCategory } = req.models;
        const { id } = req.params;
        const { name, description, limit, amount, benefitCategoryId } = req.body || {};

        // Validate input
        const validationErrors = validateBenefitUpdate(req.body);
        if (validationErrors.length > 0) {
            return res.fail(validationErrors.join(', '), 400);
        }

        const benefit = await Benefit.findByPk(id);
        if (!benefit) return res.fail('Benefit not found', 404);

        const oldCategoryId = benefit.benefitCategoryId;

        // Validate new benefit category if provided
        if (benefitCategoryId && benefitCategoryId !== oldCategoryId) {
            const newBenefitCategory = await BenefitCategory.findByPk(benefitCategoryId);
            if (!newBenefitCategory) {
                return res.fail('New benefit category not found', 400);
            }
        }

        // Check if benefit name already exists within the target category
        if (name) {
            const targetCategoryId = benefitCategoryId || oldCategoryId;
            const existingBenefit = await Benefit.findOne({
                where: {
                    name,
                    benefitCategoryId: targetCategoryId,
                    id: { [Op.ne]: id }
                }
            });
            if (existingBenefit) {
                return res.fail('Benefit with this name already exists in this category', 400);
            }
        }

        const sequelize = Benefit.sequelize;

        await sequelize.transaction(async (t) => {
            await benefit.update({
                name,
                description,
                limit,
                amount,
                benefitCategoryId
            }, { transaction: t });

            // If category changed, update counts
            if (benefitCategoryId && benefitCategoryId !== oldCategoryId) {
                // Decrease count in old category
                await BenefitCategory.decrement('count', {
                    where: { id: oldCategoryId },
                    transaction: t
                });

                // Increase count in new category
                await BenefitCategory.increment('count', {
                    where: { id: benefitCategoryId },
                    transaction: t
                });
            }
        });

        // Get updated benefit with category
        const updatedBenefit = await Benefit.findByPk(id);
        const benefitCategory = await BenefitCategory.findByPk(updatedBenefit.benefitCategoryId);

        await addAuditLog(req.models, {
            action: 'benefit.update',
            message: `Benefit ${updatedBenefit.name} updated`,
            userId: (req.user && req.user.id) ? req.user.id : null,
            userType: (req.user && req.user.type) ? req.user.type : null,
            meta: { benefitId: id, benefitCategoryId: updatedBenefit.benefitCategoryId }
        });

        const result = { ...updatedBenefit.toJSON(), benefitCategory };

        return res.success(result, 'Benefit updated successfully');
    } catch (err) {
        return next(err);
    }
}

async function deleteBenefit(req, res, next) {
    try {
        const { Benefit, BenefitCategory } = req.models;
        const { id } = req.params;

        const benefit = await Benefit.findByPk(id);
        if (!benefit) return res.fail('Benefit not found', 404);

        const benefitCategoryId = benefit.benefitCategoryId;
        const benefitName = benefit.name;

        const sequelize = Benefit.sequelize;

        await sequelize.transaction(async (t) => {
            await benefit.destroy({ transaction: t });

            // Update benefit category count
            await BenefitCategory.decrement('count', {
                where: { id: benefitCategoryId },
                transaction: t
            });
        });

        await addAuditLog(req.models, {
            action: 'benefit.delete',
            message: `Benefit ${benefitName} deleted`,
            userId: (req.user && req.user.id) ? req.user.id : null,
            userType: (req.user && req.user.type) ? req.user.type : null,
            meta: { benefitId: id, benefitCategoryId }
        });

        return res.success(null, 'Benefit deleted successfully');
    } catch (err) {
        return next(err);
    }
}

async function listBenefits(req, res, next) {
    try {
        const { Benefit, BenefitCategory } = req.models;
        const { limit = 10, page = 1, q, benefitCategoryId } = req.query;

        // if client passes limit=all (case-insensitive), return all results without pagination
        const isAll = String(limit).toLowerCase() === 'all';
        const limitNum = isAll ? 0 : Number(limit);
        const pageNum = isAll ? 1 : (Number(page) || 1);
        const offset = isAll ? 0 : (pageNum - 1) * limitNum;

        const where = {};
        if (q) {
            where.name = { [Op.iLike || Op.like]: `%${q}%` };
        }
        if (benefitCategoryId) {
            where.benefitCategoryId = benefitCategoryId;
        }

        // total count for pagination
        const total = await Benefit.count({ where });

        const findOptions = {
            where,
            include: [{
                model: BenefitCategory,
                attributes: ['id', 'name']
            }],
            order: [['created_at', 'DESC']]
        };

        if (!isAll) {
            findOptions.limit = limitNum;
            findOptions.offset = Number(offset);
        }

        const benefits = await Benefit.findAll(findOptions);

        const hasPrevPage = !isAll && pageNum > 1;
        const hasNextPage = !isAll && (offset + benefits.length < total);
        const totalPages = isAll ? 1 : (limitNum > 0 ? Math.ceil(total / limitNum) : 1);

        return res.success({
            list: benefits,
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

async function getBenefit(req, res, next) {
    try {
        const { Benefit, BenefitCategory } = req.models;
        const { id } = req.params;

        const benefit = await Benefit.findByPk(id, {
            include: [{
                model: BenefitCategory,
                attributes: ['id', 'name']
            }]
        });

        if (!benefit) return res.fail('Benefit not found', 404);

        return res.success(benefit);
    } catch (err) {
        return next(err);
    }
}

module.exports = {
    createBenefit,
    updateBenefit,
    deleteBenefit,
    listBenefits,
    getBenefit,
};
