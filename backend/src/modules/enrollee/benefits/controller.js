const { Op } = require('sequelize');

/**
 * Get benefits for an enrollee based on their plan
 * Logic:
 * 1. Get the enrollee and their companyPlanId
 * 2. Get the CompanyPlan with planType ('standard' or 'custom')
 * 3. If planType is 'standard': Get planId from CompanyPlan, then fetch PlanBenefits and Benefits
 * 4. If planType is 'custom': Fetch CompanyPlanBenefits and Benefits directly
 */
async function getEnrolleeBenefits(req, res, next) {
    try {
        const { Enrollee, CompanyPlan, Plan, PlanBenefit, CompanyPlanBenefit, Benefit, BenefitCategory } = req.models;
        const enrolleeId = req.user?.id;

        if (!enrolleeId) {
            return res.fail('Enrollee not authenticated', 401);
        }

        const { limit = 10, page = 1, search = '', status = '' } = req.query;
        const pageNum = Math.max(1, parseInt(page) || 1);
        const limitNum = Math.max(1, Math.min(100, parseInt(limit) || 10));
        const offset = (pageNum - 1) * limitNum;

        // Get the enrollee with their company plan
        const enrollee = await Enrollee.findByPk(enrolleeId, {
            include: [
                {
                    model: CompanyPlan,
                    as: 'companyPlan',
                    attributes: ['id', 'planType', 'planId', 'name', 'currency'],
                    required: true
                }
            ]
        });

        if (!enrollee) {
            return res.fail('Enrollee not found', 404);
        }

        const companyPlan = enrollee.companyPlan;
        if (!companyPlan) {
            return res.fail('No company plan associated with this enrollee', 404);
        }

        let benefits = [];
        let totalCount = 0;

        try {
            if (companyPlan.planType === 'standard' && companyPlan.planId) {
                // STANDARD PLAN: Get benefits through Plan -> PlanBenefit -> Benefit
                const planBenefits = await PlanBenefit.findAll({
                    where: { planId: companyPlan.planId },
                    attributes: ['benefitId'],
                    raw: true
                });

                const benefitIds = planBenefits.map(pb => pb.benefitId);

                if (benefitIds.length > 0) {
                    const whereClause = {
                        id: {
                            [Op.in]: benefitIds
                        }
                    };

                    if (search) {
                        whereClause[Op.or] = [
                            { name: { [Op.iLike]: `%${search}%` } },
                            { description: { [Op.iLike]: `%${search}%` } }
                        ];
                    }

                    totalCount = await Benefit.count({ where: whereClause });

                    benefits = await Benefit.findAll({
                        where: whereClause,
                        include: [
                            {
                                model: BenefitCategory,
                                as: 'benefitCategory',
                                attributes: ['id', 'name']
                            }
                        ],
                        limit: limitNum,
                        offset: offset,
                        order: [['created_at', 'DESC']],
                        raw: true,
                        subQuery: false
                    });
                }
            } else {
                // CUSTOM PLAN: Get benefits through CompanyPlanBenefit -> Benefit
                const companyPlanBenefits = await CompanyPlanBenefit.findAll({
                    where: { companyPlanId: companyPlan.id },
                    attributes: ['benefitId'],
                    raw: true
                });

                const benefitIds = companyPlanBenefits.map(cpb => cpb.benefitId);

                if (benefitIds.length > 0) {
                    const whereClause = {
                        id: {
                            [Op.in]: benefitIds
                        }
                    };

                    if (search) {
                        whereClause[Op.or] = [
                            { name: { [Op.iLike]: `%${search}%` } },
                            { description: { [Op.iLike]: `%${search}%` } }
                        ];
                    }

                    totalCount = await Benefit.count({ where: whereClause });

                    benefits = await Benefit.findAll({
                        where: whereClause,
                        include: [
                            {
                                model: BenefitCategory,
                                as: 'benefitCategory',
                                attributes: ['id', 'name']
                            }
                        ],
                        limit: limitNum,
                        offset: offset,
                        order: [['created_at', 'DESC']],
                        raw: true,
                        subQuery: false
                    });
                }
            }
        } catch (err) {
            console.error('Error fetching benefits:', err);
            return next(err);
        }

        // Format benefits response - only include fields present in database
        const formattedBenefits = benefits.map(benefit => {
            const formatted = {
                id: benefit.id,
                name: benefit.name,
                benefitCategoryId: benefit.benefit_category_id,
                benefitCategory: benefit.benefitCategory?.name,
                isCovered: benefit.is_covered,
                createdAt: benefit.created_at,
                updatedAt: benefit.updated_at,
            };

            // Only add optional fields if they exist and are not null
            if (benefit.description) formatted.description = benefit.description;
            if (benefit.coverage_type) formatted.coverageType = benefit.coverage_type;
            if (benefit.coverage_value) formatted.coverageValue = benefit.coverage_value;

            return formatted;
        });

        const totalPages = Math.ceil(totalCount / limitNum);
        const hasNextPage = pageNum < totalPages;
        const hasPreviousPage = pageNum > 1;

        return res.success({
            benefits: formattedBenefits,
            pagination: {
                page: pageNum,
                limit: limitNum,
                total: totalCount,
                totalPages,
                hasNextPage,
                hasPreviousPage
            },
            plan: {
                id: companyPlan.id,
                name: companyPlan.name,
                planType: companyPlan.planType,
                currency: companyPlan.currency
            }
        }, 'Benefits retrieved successfully');

    } catch (err) {
        console.error('Error in getEnrolleeBenefits:', err);
        return next(err);
    }
}

/**
 * Get a specific benefit detail for an enrollee
 */
async function getEnrolleeBenefitById(req, res, next) {
    try {
        const { Benefit, BenefitCategory } = req.models;
        const { benefitId } = req.params;

        const benefit = await Benefit.findByPk(benefitId, {
            include: [
                {
                    model: BenefitCategory,
                    as: 'benefitCategory',
                    attributes: ['id', 'name']
                }
            ]
        });

        if (!benefit) {
            return res.fail('Benefit not found', 404);
        }

        const formatted = {
            id: benefit.id,
            name: benefit.name,
            benefitCategoryId: benefit.benefitCategoryId,
            benefitCategory: benefit.benefitCategory?.name,
            isCovered: benefit.isCovered,
            createdAt: benefit.createdAt,
            updatedAt: benefit.updatedAt
        };

        // Only add optional fields if they exist and are not null
        if (benefit.description) formatted.description = benefit.description;
        if (benefit.coverageType) formatted.coverageType = benefit.coverageType;
        if (benefit.coverageValue) formatted.coverageValue = benefit.coverageValue;

        return res.success(formatted, 'Benefit retrieved successfully');

    } catch (err) {
        return next(err);
    }
}

module.exports = {
    getEnrolleeBenefits,
    getEnrolleeBenefitById
};
