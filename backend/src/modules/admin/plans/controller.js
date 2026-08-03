'use strict';

const { Op } = require('sequelize');
const { addAuditLog } = require('../../../utils/addAdminNotification');
const {
    getRawDependentAgeLimits,
    normalizeDependentAgeLimitPayload,
    isDependentAgeLimitValidationError
} = require('../../../utils/dependentAgeLimits');

async function createPlan(req, res, next) {
    try {
        const { Plan } = req.models;
        const {
            name,
            code,
            description,
            ageLimit,
            maxNumberOfDependents,
            discountPerEnrolee,
            planCycle,
            annualPremiumPrice,
            allowDependentEnrolee,
            currency
        } = req.body || {};
        // normalize plan code to upper case for storage and uniqueness checks
        const codeUpper = (code !== undefined && code !== null) ? String(code).toUpperCase() : code;

        if (!name) return res.fail('`name` is required', 400);
        if (!code) return res.fail('`code` is required', 400);

        let dependentAgeLimitData;
        try {
            dependentAgeLimitData = normalizeDependentAgeLimitPayload(req.body || {});
        } catch (error) {
            if (isDependentAgeLimitValidationError(error)) return res.fail(error.message, 400);
            throw error;
        }

        // ensure unique code
        const existing = await Plan.findOne({ where: { code: codeUpper } });
        if (existing) return res.fail('`code` must be unique', 400);

        // status defaults to 'pending' per model
        const plan = await Plan.create({
            name,
            code: codeUpper,
            description,
            ageLimit,
            ...dependentAgeLimitData,
            maxNumberOfDependents,
            discountPerEnrolee,
            planCycle,
            annualPremiumPrice,
            allowDependentEnrolee: allowDependentEnrolee !== undefined ? allowDependentEnrolee : true,
            currency: currency || 'NGN'
        });

        await addAuditLog(req.models, {
            action: 'plan.create',
            message: `Plan ${plan.name} created`,
            userId: (req.user && req.user.id) ? req.user.id : null,
            userType: (req.user && req.user.type) ? req.user.type : null,
            meta: { planId: plan.id }
        });

        // create an admin approval record for this plan and notify admins
        // (async () => {
        //     try {
        //         const requestedBy = (req.user && req.user.id) ? req.user.id : 'system';
        //         const requestedByType = (req.user && req.user.type) ? req.user.type : 'Admin';

        //         await createAdminApproval(req.models, {
        //             model: 'Plan',
        //             modelId: plan.id,
        //             action: 'create',
        //             details: JSON.stringify({ name, code: codeUpper, description }),
        //             requestedBy,
        //             requestedByType,
        //             comments: null,
        //             meta: { planName: plan.name }
        //         });


        //     } catch (err) {
        //         // don't fail the main request if approval creation fails
        //         if (console && console.warn) console.warn('Failed to create admin approval for plan:', err.message || err);
        //     }
        // })();

        return res.success({ plan: plan.toJSON() }, 'Plan created', 201);
    } catch (err) {
        return next(err);
    }
}

async function updatePlan(req, res, next) {
    try {
        const { Plan } = req.models;
        const { id } = req.params;
        const {
            name,
            code,
            description,
            status,
            isActive,
            isApproved,
            ageLimit,
            maxNumberOfDependents,
            discountPerEnrolee,
            planCycle,
            annualPremiumPrice,
            allowDependentEnrolee,
            currency
        } = req.body || {};
        // normalize plan code to upper case for updates
        const codeUpper = (code !== undefined && code !== null) ? String(code).toUpperCase() : code;

        const plan = await Plan.findByPk(id);
        if (!plan) return res.fail('Plan not found', 404);

        let dependentAgeLimitData;
        try {
            dependentAgeLimitData = normalizeDependentAgeLimitPayload(req.body || {}, {
                partial: true,
                existingDependentAgeLimits: getRawDependentAgeLimits(plan)
            });
        } catch (error) {
            if (isDependentAgeLimitValidationError(error)) return res.fail(error.message, 400);
            throw error;
        }

        const updates = {};
        if (name !== undefined) updates.name = name;
        if (description !== undefined) updates.description = description;
        if (status !== undefined) updates.status = status;
        if (isActive !== undefined) updates.isActive = isActive;
        if (isApproved !== undefined) updates.isApproved = isApproved;
        if (ageLimit !== undefined) updates.ageLimit = ageLimit;
        Object.assign(updates, dependentAgeLimitData);
        if (maxNumberOfDependents !== undefined) updates.maxNumberOfDependents = maxNumberOfDependents;
        if (discountPerEnrolee !== undefined) updates.discountPerEnrolee = discountPerEnrolee;
        if (planCycle !== undefined) updates.planCycle = planCycle;
        if (annualPremiumPrice !== undefined) updates.annualPremiumPrice = annualPremiumPrice;
        if (allowDependentEnrolee !== undefined) updates.allowDependentEnrolee = allowDependentEnrolee;
        if (currency !== undefined) updates.currency = currency;

        if (code !== undefined) {
            // ensure unique code (exclude current record)
            const other = await Plan.findOne({ where: { code: codeUpper, id: { [Op.ne]: id } } });
            if (other) return res.fail('`code` must be unique', 400);
            updates.code = codeUpper;
        }

        await plan.update(updates);

        await addAuditLog(req.models, {
            action: 'plan.update',
            message: `Plan ${plan.name} updated`,
            userId: (req.user && req.user.id) ? req.user.id : null,
            userType: (req.user && req.user.type) ? req.user.type : null,
            meta: { planId: plan.id }
        });

        return res.success({ plan }, 'Plan updated');
    } catch (err) {
        return next(err);
    }
}

async function deletePlan(req, res, next) {
    try {
        const { Plan } = req.models;
        const { id } = req.params;

        const plan = await Plan.findByPk(id);
        if (!plan) return res.fail('Plan not found', 404);

        await plan.destroy();

        await addAuditLog(req.models, {
            action: 'plan.delete',
            message: `Plan ${plan.name} deleted`,
            userId: (req.user && req.user.id) ? req.user.id : null,
            userType: (req.user && req.user.type) ? req.user.type : null,
            meta: { planId: id }
        });

        return res.success(null, 'Plan deleted');
    } catch (err) {
        return next(err);
    }
}

async function listPlans(req, res, next) {
    try {
        const { Plan } = req.models;
        const { limit = 10, page = 1, q } = req.query;

        const isAll = String(limit).toLowerCase() === 'all';
        const limitNum = isAll ? 0 : Number(limit);
        const pageNum = isAll ? 1 : (Number(page) || 1);
        const offset = isAll ? 0 : (pageNum - 1) * limitNum;

        const where = {};
        if (q) {
            where[Op.or] = [
                { name: { [Op.iLike || Op.like]: `%${q}%` } },
                { code: { [Op.iLike || Op.like]: `%${q}%` } }
            ];
        }

        const total = await Plan.count({ where });

        const findOptions = {
            where,
            order: [['created_at', 'DESC']]
        };

        if (!isAll) {
            findOptions.limit = limitNum;
            findOptions.offset = Number(offset);
        }

        const plans = await Plan.findAll(findOptions);
        const data = plans.map(p => p.toJSON());

        const hasPrevPage = !isAll && pageNum > 1;
        const hasNextPage = !isAll && (offset + plans.length < total);
        const totalPages = isAll ? 1 : (limitNum > 0 ? Math.ceil(total / limitNum) : 1);

        return res.success({ list: data, count: total, page: pageNum, limit: isAll ? 'all' : limitNum, totalPages, hasNextPage, hasPrevPage });
    } catch (err) {
        return next(err);
    }
}

async function getPlan(req, res, next) {
    try {
        const { Plan } = req.models;
        const { id } = req.params;
        const { include } = req.query;

        const findOptions = {
            where: { id }
        };

        // Handle include parameter for relationships
        if (include) {
            const includes = String(include).split(',').map(s => s.trim());
            const association = [];

            if (includes.includes('benefitCategories')) {
                association.push({ association: 'benefitCategories', through: { attributes: [] } });
            }
            if (includes.includes('benefits')) {
                association.push({ association: 'benefits', through: { attributes: [] } });
            }
            if (includes.includes('exclusions')) {
                association.push({ association: 'exclusions' });
            }
            if (includes.includes('providers')) {
                association.push({ association: 'providers' });
            }

            if (association.length > 0) {
                findOptions.include = association;
            }
        }

        const plan = await Plan.findByPk(id, findOptions);
        if (!plan) return res.fail('Plan not found', 404);

        return res.success(plan.toJSON());
    } catch (err) {
        return next(err);
    }
}

function normalizeSelectedIds(value, fieldName) {
    if (!Array.isArray(value)) {
        const error = new Error(`\`${fieldName}\` must be an array`);
        error.status = 400;
        throw error;
    }

    const ids = value.map(id => String(id || '').trim());
    if (ids.some(id => !id)) {
        const error = new Error(`\`${fieldName}\` must contain valid IDs`);
        error.status = 400;
        throw error;
    }

    return [...new Set(ids)];
}

async function findPlanWithBenefits(Plan, planId) {
    return Plan.findByPk(planId, {
        include: [
            { association: 'benefitCategories', through: { attributes: [] } },
            { association: 'benefits', through: { attributes: [] } }
        ]
    });
}

// Replace a plan's complete benefit-category selection atomically.
async function syncBenefitCategories(req, res, next) {
    let transaction;

    try {
        const { Plan, BenefitCategory, Benefit, PlanBenefitCategory, PlanBenefit } = req.models;
        const { id: planId } = req.params;
        const benefitCategoryIds = normalizeSelectedIds(
            req.body && req.body.benefitCategoryIds,
            'benefitCategoryIds'
        );

        transaction = await Plan.sequelize.transaction();

        const plan = await Plan.findByPk(planId, {
            transaction,
            lock: transaction.LOCK.UPDATE
        });
        if (!plan) {
            await transaction.rollback();
            transaction = null;
            return res.fail('Plan not found', 404);
        }

        if (benefitCategoryIds.length > 0) {
            const categories = await BenefitCategory.findAll({
                where: { id: { [Op.in]: benefitCategoryIds } },
                attributes: ['id'],
                transaction
            });
            const existingIds = new Set(categories.map(category => String(category.id)));
            const invalidIds = benefitCategoryIds.filter(id => !existingIds.has(id));
            if (invalidIds.length > 0) {
                await transaction.rollback();
                transaction = null;
                return res.fail('Some benefit categories do not exist', 400);
            }
        }

        const currentCategories = await PlanBenefitCategory.findAll({
            where: { planId },
            attributes: ['benefitCategoryId'],
            transaction
        });
        const selectedCategoryIds = new Set(benefitCategoryIds);
        const removedCategoryIds = [
            ...new Set(
                currentCategories
                    .map(category => String(category.benefitCategoryId))
                    .filter(categoryId => !selectedCategoryIds.has(categoryId))
            )
        ];

        const allowedBenefits = benefitCategoryIds.length > 0
            ? await Benefit.findAll({
                where: { benefitCategoryId: { [Op.in]: benefitCategoryIds } },
                attributes: ['id'],
                transaction
            })
            : [];
        const allowedBenefitIds = allowedBenefits.map(benefit => String(benefit.id));

        // Remove benefits from every unselected category, including legacy orphan rows.
        await PlanBenefit.destroy({
            where: allowedBenefitIds.length > 0
                ? { planId, benefitId: { [Op.notIn]: allowedBenefitIds } }
                : { planId },
            transaction
        });

        // Replacing the join rows also repairs any legacy duplicates.
        await PlanBenefitCategory.destroy({ where: { planId }, transaction });
        if (benefitCategoryIds.length > 0) {
            await PlanBenefitCategory.bulkCreate(
                benefitCategoryIds.map(benefitCategoryId => ({ planId, benefitCategoryId })),
                { transaction }
            );
        }

        await transaction.commit();
        transaction = null;

        const updatedPlan = await findPlanWithBenefits(Plan, planId);

        try {
            await addAuditLog(req.models, {
                action: 'plan.benefitCategories.sync',
                message: `Benefit categories updated for Plan ${plan.name}`,
                userId: (req.user && req.user.id) ? req.user.id : null,
                userType: (req.user && req.user.type) ? req.user.type : null,
                meta: {
                    planId,
                    selectedCount: benefitCategoryIds.length,
                    removedCategoryIds
                }
            });
        } catch (auditError) {
            console.warn('Failed to create plan benefit-category audit log:', auditError.message || auditError);
        }

        return res.success(
            { plan: updatedPlan.toJSON() },
            'Plan benefit categories updated'
        );
    } catch (err) {
        if (transaction && !transaction.finished) {
            await transaction.rollback();
        }
        if (err && err.status === 400) return res.fail(err.message, 400);
        return next(err);
    }
}

// Replace the selected benefits within one plan category atomically.
async function syncBenefits(req, res, next) {
    let transaction;

    try {
        const { Plan, BenefitCategory, Benefit, PlanBenefitCategory, PlanBenefit } = req.models;
        const { planId, benefitCategoryId } = req.params;
        const benefitIds = normalizeSelectedIds(req.body && req.body.benefitIds, 'benefitIds');

        transaction = await Plan.sequelize.transaction();

        const plan = await Plan.findByPk(planId, {
            transaction,
            lock: transaction.LOCK.UPDATE
        });
        if (!plan) {
            await transaction.rollback();
            transaction = null;
            return res.fail('Plan not found', 404);
        }

        const category = await BenefitCategory.findByPk(benefitCategoryId, { transaction });
        if (!category) {
            await transaction.rollback();
            transaction = null;
            return res.fail('Benefit category not found', 404);
        }

        const planCategory = await PlanBenefitCategory.findOne({
            where: { planId, benefitCategoryId },
            transaction
        });
        if (!planCategory) {
            await transaction.rollback();
            transaction = null;
            return res.fail('Save this benefit category on the plan before selecting its benefits', 409);
        }

        const categoryBenefits = await Benefit.findAll({
            where: { benefitCategoryId },
            attributes: ['id'],
            transaction
        });
        const categoryBenefitIds = categoryBenefits.map(benefit => String(benefit.id));
        const validBenefitIds = new Set(categoryBenefitIds);
        const invalidBenefitIds = benefitIds.filter(id => !validBenefitIds.has(id));
        if (invalidBenefitIds.length > 0) {
            await transaction.rollback();
            transaction = null;
            return res.fail('Some benefits do not exist in this benefit category', 400);
        }

        if (categoryBenefitIds.length > 0) {
            await PlanBenefit.destroy({
                where: {
                    planId,
                    benefitId: { [Op.in]: categoryBenefitIds }
                },
                transaction
            });
        }
        if (benefitIds.length > 0) {
            await PlanBenefit.bulkCreate(
                benefitIds.map(benefitId => ({ planId, benefitId })),
                { transaction }
            );
        }

        await transaction.commit();
        transaction = null;

        try {
            await addAuditLog(req.models, {
                action: 'plan.benefits.sync',
                message: `Benefits updated for Plan ${plan.name}`,
                userId: (req.user && req.user.id) ? req.user.id : null,
                userType: (req.user && req.user.type) ? req.user.type : null,
                meta: { planId, benefitCategoryId, selectedCount: benefitIds.length }
            });
        } catch (auditError) {
            console.warn('Failed to create plan-benefit audit log:', auditError.message || auditError);
        }

        return res.success(
            { benefitCategoryId, benefitIds },
            'Plan benefits updated'
        );
    } catch (err) {
        if (transaction && !transaction.finished) {
            await transaction.rollback();
        }
        if (err && err.status === 400) return res.fail(err.message, 400);
        return next(err);
    }
}

// Add benefit category to plan
async function addBenefitCategory(req, res, next) {
    try {
        const { Plan, PlanBenefitCategory, PlanBenefit, Benefit } = req.models;
        const { planId, benefitCategoryId, benefitIds = [] } = req.body || {};

        if (!planId) return res.fail('`planId` is required', 400);
        if (!benefitCategoryId) return res.fail('`benefitCategoryId` is required', 400);

        const plan = await Plan.findByPk(planId);
        if (!plan) return res.fail('Plan not found', 404);

        // Check if already exists
        const existing = await PlanBenefitCategory.findOne({ where: { planId, benefitCategoryId } });
        if (existing) return res.fail('Benefit category already added to this plan', 400);

        const planBenefitCategory = await PlanBenefitCategory.create({ planId, benefitCategoryId });

        // If specific benefits are provided, add them
        let benefitRecords = [];
        if (Array.isArray(benefitIds) && benefitIds.length > 0) {
            // Validate that all provided benefit IDs exist and belong to this category
            const benefits = await Benefit.findAll({
                where: {
                    id: benefitIds,
                    benefitCategoryId
                }
            });

            if (benefits.length !== benefitIds.length) {
                // Some benefits don't exist or don't belong to this category
                await planBenefitCategory.destroy(); // Rollback the category addition
                return res.fail('Some benefits do not exist in this benefit category', 400);
            }

            // Add each benefit to the plan
            benefitRecords = await Promise.all(
                benefitIds.map(benefitId =>
                    PlanBenefit.create({
                        planId,
                        benefitId
                    })
                )
            );
        }

        await addAuditLog(req.models, {
            action: 'plan.benefitCategory.add',
            message: `Benefit category added to Plan ${plan.name} with ${benefitRecords.length} benefits`,
            userId: (req.user && req.user.id) ? req.user.id : null,
            userType: (req.user && req.user.type) ? req.user.type : null,
            meta: { planId, benefitCategoryId, benefitsAdded: benefitRecords.length }
        });

        return res.success({
            category: planBenefitCategory.toJSON(),
            benefits: benefitRecords.map(b => b.toJSON()),
            totalBenefitsAdded: benefitRecords.length
        }, 'Benefit category added to plan with selected benefits', 201);
    } catch (err) {
        return next(err);
    }
}

// Remove benefit category from plan
async function removeBenefitCategory(req, res, next) {
    try {
        const { PlanBenefitCategory } = req.models;
        const { planId, benefitCategoryId } = req.params;

        const planBenefitCategory = await PlanBenefitCategory.findOne({ where: { planId, benefitCategoryId } });
        if (!planBenefitCategory) return res.fail('Benefit category not found for this plan', 404);

        await planBenefitCategory.destroy();

        await addAuditLog(req.models, {
            action: 'plan.benefitCategory.remove',
            message: `Benefit category removed from plan`,
            userId: (req.user && req.user.id) ? req.user.id : null,
            userType: (req.user && req.user.type) ? req.user.type : null,
            meta: { planId, benefitCategoryId }
        });

        return res.success(null, 'Benefit category removed from plan');
    } catch (err) {
        return next(err);
    }
}

// Add exclusion to plan
async function addExclusion(req, res, next) {
    try {
        const { Plan, PlanExclusion } = req.models;
        const { planId, exclusionId } = req.body || {};

        if (!planId) return res.fail('`planId` is required', 400);
        if (!exclusionId) return res.fail('`exclusionId` is required', 400);

        const plan = await Plan.findByPk(planId);
        if (!plan) return res.fail('Plan not found', 404);

        // Check if already exists
        const existing = await PlanExclusion.findOne({ where: { planId, exclusionId } });
        if (existing) return res.fail('Exclusion already added to this plan', 400);

        const planExclusion = await PlanExclusion.create({ planId, exclusionId });

        await addAuditLog(req.models, {
            action: 'plan.exclusion.add',
            message: `Exclusion added to Plan ${plan.name}`,
            userId: (req.user && req.user.id) ? req.user.id : null,
            userType: (req.user && req.user.type) ? req.user.type : null,
            meta: { planId, exclusionId }
        });

        return res.success({ planExclusion: planExclusion.toJSON() }, 'Exclusion added to plan', 201);
    } catch (err) {
        return next(err);
    }
}

// Remove exclusion from plan
async function removeExclusion(req, res, next) {
    try {
        const { PlanExclusion } = req.models;
        const { planId, exclusionId } = req.params;

        const planExclusion = await PlanExclusion.findOne({ where: { planId, exclusionId } });
        if (!planExclusion) return res.fail('Exclusion not found for this plan', 404);

        await planExclusion.destroy();

        await addAuditLog(req.models, {
            action: 'plan.exclusion.remove',
            message: `Exclusion removed from plan`,
            userId: (req.user && req.user.id) ? req.user.id : null,
            userType: (req.user && req.user.type) ? req.user.type : null,
            meta: { planId, exclusionId }
        });

        return res.success(null, 'Exclusion removed from plan');
    } catch (err) {
        return next(err);
    }
}

// Add provider to plan
async function addProvider(req, res, next) {
    try {
        const { Plan, ProviderPlan } = req.models;
        const { planId, providerId } = req.body || {};

        if (!planId) return res.fail('`planId` is required', 400);
        if (!providerId) return res.fail('`providerId` is required', 400);

        const plan = await Plan.findByPk(planId);
        if (!plan) return res.fail('Plan not found', 404);

        // Check if already exists
        const existing = await ProviderPlan.findOne({ where: { planId, providerId } });
        if (existing) return res.fail('Provider already added to this plan', 400);

        const providerPlan = await ProviderPlan.create({ planId, providerId });

        await addAuditLog(req.models, {
            action: 'plan.provider.add',
            message: `Provider added to Plan ${plan.name}`,
            userId: (req.user && req.user.id) ? req.user.id : null,
            userType: (req.user && req.user.type) ? req.user.type : null,
            meta: { planId, providerId }
        });

        return res.success({ providerPlan: providerPlan.toJSON() }, 'Provider added to plan', 201);
    } catch (err) {
        return next(err);
    }
}

// Remove provider from plan
async function removeProvider(req, res, next) {
    try {
        const { ProviderPlan } = req.models;
        const { planId, providerId } = req.params;

        const providerPlan = await ProviderPlan.findOne({ where: { planId, providerId } });
        if (!providerPlan) return res.fail('Provider not found for this plan', 404);

        await providerPlan.destroy();

        await addAuditLog(req.models, {
            action: 'plan.provider.remove',
            message: `Provider removed from plan`,
            userId: (req.user && req.user.id) ? req.user.id : null,
            userType: (req.user && req.user.type) ? req.user.type : null,
            meta: { planId, providerId }
        });

        return res.success(null, 'Provider removed from plan');
    } catch (err) {
        return next(err);
    }
}

// Add specific benefit to plan
async function addBenefit(req, res, next) {
    try {
        const { Plan, PlanBenefit, PlanBenefitCategory, Benefit } = req.models;
        const { planId, benefitId } = req.body || {};

        if (!planId) return res.fail('`planId` is required', 400);
        if (!benefitId) return res.fail('`benefitId` is required', 400);

        const plan = await Plan.findByPk(planId);
        if (!plan) return res.fail('Plan not found', 404);

        // Verify benefit exists
        const benefit = await Benefit.findByPk(benefitId);
        if (!benefit) return res.fail('Benefit not found', 404);

        // Check if already exists
        const existing = await PlanBenefit.findOne({
            where: { planId, benefitId }
        });
        if (existing) return res.fail('Benefit already added to this plan', 400);

        // Ensure the benefit's category is added to the plan
        if (benefit.benefitCategoryId) {
            const existingCategory = await PlanBenefitCategory.findOne({
                where: { planId, benefitCategoryId: benefit.benefitCategoryId }
            });

            // If category doesn't exist, add it
            if (!existingCategory) {
                await PlanBenefitCategory.create({
                    planId,
                    benefitCategoryId: benefit.benefitCategoryId
                });
            }
        }

        const record = await PlanBenefit.create({
            planId,
            benefitId
        });

        await addAuditLog(req.models, {
            action: 'plan.addBenefit',
            message: `Benefit ${benefit.name} added to plan ${plan.name}`,
            userId: (req.user && req.user.id) ? req.user.id : null,
            userType: (req.user && req.user.type) ? req.user.type : null,
            meta: { planId, benefitId }
        });

        return res.success({ record: record.toJSON() }, 'Benefit added', 201);
    } catch (err) {
        return next(err);
    }
}

// Remove specific benefit from plan
async function removeBenefit(req, res, next) {
    try {
        const { PlanBenefit } = req.models;
        const { planId, benefitId } = req.params;

        const record = await PlanBenefit.findOne({
            where: { planId, benefitId }
        });
        if (!record) return res.fail('Benefit not found in this plan', 404);

        await record.destroy();

        await addAuditLog(req.models, {
            action: 'plan.removeBenefit',
            message: `Benefit removed from plan`,
            userId: (req.user && req.user.id) ? req.user.id : null,
            userType: (req.user && req.user.type) ? req.user.type : null,
            meta: { planId, benefitId }
        });

        return res.success(null, 'Benefit removed');
    } catch (err) {
        return next(err);
    }
}

module.exports = {
    createPlan,
    updatePlan,
    deletePlan,
    listPlans,
    getPlan,
    syncBenefitCategories,
    syncBenefits,
    addBenefitCategory,
    removeBenefitCategory,
    addBenefit,
    removeBenefit,
    addExclusion,
    removeExclusion,
    addProvider,
    removeProvider
};
