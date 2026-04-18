const { Op } = require('sequelize');

/**
 * Get all benefits for a retail enrollee based on their plan's benefit categories
 */
async function getRetailEnrolleeBenefits(req, res, next) {
    try {
        const {
            RetailEnrollee,
            Plan,
            BenefitCategory,
            Benefit
        } = req.models;
        const { retailEnrolleeId } = req.params;
        const { page = 1, limit = 10 } = req.query;

        if (!retailEnrolleeId) return res.fail('`retailEnrolleeId` is required', 400);

        // Verify enrollee exists and get their plan
        const enrollee = await RetailEnrollee.findByPk(retailEnrolleeId, {
            include: [{ model: Plan, as: 'plan' }]
        });
        if (!enrollee) return res.fail('Retail enrollee not found', 404);

        const plan = enrollee.plan;
        if (!plan) return res.success({ benefits: [], pagination: { total: 0, page: 1, limit, pages: 0 } }, 'No plan associated with enrollee');

        // Get benefits for this plan
        const offset = (page - 1) * limit;
        const { count, rows } = await Benefit.findAndCountAll({
            include: [
                {
                    model: BenefitCategory,
                    attributes: ['id', 'name']
                }
            ],
            limit: parseInt(limit),
            offset,
            order: [['createdAt', 'DESC']],
            distinct: true
        });

        return res.success(
            {
                benefits: rows,
                pagination: {
                    total: count,
                    page: parseInt(page),
                    limit: parseInt(limit),
                    pages: Math.ceil(count / limit),
                    hasNextPage: offset + rows.length < count,
                    hasPreviousPage: page > 1
                }
            },
            'Benefits retrieved successfully'
        );
    } catch (error) {
        return next(error);
    }
}

/**
 * Get a single benefit for a retail enrollee with full details
 */
async function getRetailEnrolleeBenefitById(req, res, next) {
    try {
        const { Benefit } = req.models;
        const { retailEnrolleeId, benefitId } = req.params;

        if (!retailEnrolleeId) return res.fail('`retailEnrolleeId` is required', 400);
        if (!benefitId) return res.fail('`benefitId` is required', 400);

        const benefit = await Benefit.findByPk(benefitId, {
            include: [
                { model: BenefitCategory, as: 'benefitCategory', attributes: ['id', 'name'] }
            ]
        });

        if (!benefit) return res.fail('Benefit not found', 404);

        return res.success({ benefit }, 'Benefit retrieved successfully');
    } catch (error) {
        return next(error);
    }
}

module.exports = {
    getRetailEnrolleeBenefits,
    getRetailEnrolleeBenefitById
};
