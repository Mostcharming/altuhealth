const { Op } = require('sequelize');
const { addAuditLog } = require('../../../utils/addAdminNotification');

/**
 * Get all benefits for an enrollee based on their company plan's benefit categories
 * 1. Get enrollee and their company plan
 * 2. Get benefit categories linked to that plan
 * 3. Get all benefits in those categories
 */
async function getEnrolleeBenefits(req, res, next) {
    try {
        const {
            Enrollee,
            CompanyPlan,
            CompanyPlanBenefitCategory,
            BenefitCategory,
            Benefit
        } = req.models;
        const { enrolleeId } = req.params;
        const { page = 1, limit = 10, categoryId = null, search = '' } = req.query;

        if (!enrolleeId)
            return res.fail('`enrolleeId` is required', 400);

        // Verify enrollee exists and get their company plan
        const enrollee = await Enrollee.findByPk(enrolleeId);
        if (!enrollee)
            return res.fail('Enrollee not found', 404);

        const companyPlan = await CompanyPlan.findByPk(enrollee.companyPlanId);
        if (!companyPlan)
            return res.fail('Company plan not found', 404);

        // Get benefit categories for this company plan
        const benefitCategoryWhere = { companyPlanId: companyPlan.id };

        const benefitCategories = await CompanyPlanBenefitCategory.findAll({
            where: benefitCategoryWhere,
            include: [
                { model: BenefitCategory, attributes: ['id', 'name', 'count'] }
            ],
            raw: false
        });

        const categoryIds = benefitCategories.map(bc => bc.BenefitCategory.id);

        if (categoryIds.length === 0) {
            return res.success(
                {
                    benefits: [],
                    categories: [],
                    pagination: {
                        total: 0,
                        page: parseInt(page),
                        limit: parseInt(limit),
                        pages: 0
                    }
                },
                'No benefits available for this enrollee'
            );
        }

        const offset = (page - 1) * limit;
        const benefitWhere = { benefitCategoryId: { [Op.in]: categoryIds } };

        // Add category filter if provided
        if (categoryId && categoryIds.includes(categoryId)) {
            benefitWhere.benefitCategoryId = categoryId;
        }

        // Add search filter
        if (search) {
            benefitWhere[Op.or] = [
                { name: { [Op.iLike]: `%${search}%` } },
                { description: { [Op.iLike]: `%${search}%` } }
            ];
        }

        const { count, rows } = await Benefit.findAndCountAll({
            where: benefitWhere,
            include: [
                { model: BenefitCategory, attributes: ['id', 'name', 'count'] }
            ],
            limit: parseInt(limit),
            offset: parseInt(offset),
            order: [['createdAt', 'DESC']],
            subQuery: false
        });

        return res.success(
            {
                benefits: rows,
                categories: benefitCategories.map(bc => bc.BenefitCategory),
                pagination: {
                    total: count,
                    page: parseInt(page),
                    limit: parseInt(limit),
                    pages: Math.ceil(count / limit),
                    hasNextPage: offset + parseInt(limit) < count,
                    hasPreviousPage: page > 1
                }
            },
            'Enrollee benefits retrieved successfully'
        );
    } catch (error) {
        console.error('Error fetching enrollee benefits:', error);
        next(error);
    }
}

/**
 * Get a single benefit for an enrollee with full details
 */
async function getEnrolleeBenefitById(req, res, next) {
    try {
        const { Enrollee, CompanyPlan, CompanyPlanBenefitCategory, Benefit, BenefitCategory } = req.models;
        const { enrolleeId, benefitId } = req.params;

        if (!enrolleeId)
            return res.fail('`enrolleeId` is required', 400);
        if (!benefitId)
            return res.fail('`benefitId` is required', 400);

        // Verify enrollee exists
        const enrollee = await Enrollee.findByPk(enrolleeId);
        if (!enrollee)
            return res.fail('Enrollee not found', 404);

        // Get the benefit
        const benefit = await Benefit.findByPk(benefitId, {
            include: [{ model: BenefitCategory, attributes: ['id', 'name', 'count'] }]
        });

        if (!benefit)
            return res.fail('Benefit not found', 404);

        // Verify this benefit belongs to a category in the enrollee's plan
        const companyPlan = await CompanyPlan.findByPk(enrollee.companyPlanId);
        const planBenefitCategory = await CompanyPlanBenefitCategory.findOne({
            where: {
                companyPlanId: companyPlan.id,
                benefitCategoryId: benefit.benefitCategoryId
            }
        });

        if (!planBenefitCategory)
            return res.fail('This benefit is not available for this enrollee\'s plan', 403);

        return res.success(
            { benefit },
            'Benefit retrieved successfully'
        );
    } catch (error) {
        console.error('Error fetching benefit:', error);
        next(error);
    }
}

module.exports = {
    getEnrolleeBenefits,
    getEnrolleeBenefitById
};
