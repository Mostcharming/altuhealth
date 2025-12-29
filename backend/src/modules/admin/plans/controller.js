'use strict';

const { Op } = require('sequelize');
const { addAuditLog } = require('../../../utils/addAdminNotification');
const { createAdminApproval } = require('../../../utils/adminApproval');
const notify = require('../../../utils/notify');

async function createPlan(req, res, next) {
    try {
        const { Plan } = req.models;
        const { name, code, description } = req.body || {};
        // normalize plan code to upper case for storage and uniqueness checks
        const codeUpper = (code !== undefined && code !== null) ? String(code).toUpperCase() : code;

        if (!name) return res.fail('`name` is required', 400);
        if (!code) return res.fail('`code` is required', 400);

        // ensure unique code
        const existing = await Plan.findOne({ where: { code: codeUpper } });
        if (existing) return res.fail('`code` must be unique', 400);

        // status defaults to 'pending' per model
        const plan = await Plan.create({ name, code: codeUpper, description });

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
        const { name, code, description, status, isActive, isApproved } = req.body || {};
        // normalize plan code to upper case for updates
        const codeUpper = (code !== undefined && code !== null) ? String(code).toUpperCase() : code;

        const plan = await Plan.findByPk(id);
        if (!plan) return res.fail('Plan not found', 404);

        const updates = {};
        if (name !== undefined) updates.name = name;
        if (description !== undefined) updates.description = description;
        if (status !== undefined) updates.status = status;
        if (isActive !== undefined) updates.isActive = isActive;
        if (isApproved !== undefined) updates.isApproved = isApproved;

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

        const plan = await Plan.findByPk(id);
        if (!plan) return res.fail('Plan not found', 404);

        return res.success(plan.toJSON());
    } catch (err) {
        return next(err);
    }
}

// Add benefit category to plan
async function addBenefitCategory(req, res, next) {
    try {
        const { Plan, PlanBenefitCategory } = req.models;
        const { planId, benefitCategoryId } = req.body || {};

        if (!planId) return res.fail('`planId` is required', 400);
        if (!benefitCategoryId) return res.fail('`benefitCategoryId` is required', 400);

        const plan = await Plan.findByPk(planId);
        if (!plan) return res.fail('Plan not found', 404);

        // Check if already exists
        const existing = await PlanBenefitCategory.findOne({ where: { planId, benefitCategoryId } });
        if (existing) return res.fail('Benefit category already added to this plan', 400);

        const planBenefitCategory = await PlanBenefitCategory.create({ planId, benefitCategoryId });

        await addAuditLog(req.models, {
            action: 'plan.benefitCategory.add',
            message: `Benefit category added to Plan ${plan.name}`,
            userId: (req.user && req.user.id) ? req.user.id : null,
            userType: (req.user && req.user.type) ? req.user.type : null,
            meta: { planId, benefitCategoryId }
        });

        return res.success({ planBenefitCategory: planBenefitCategory.toJSON() }, 'Benefit category added to plan', 201);
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

module.exports = {
    createPlan,
    updatePlan,
    deletePlan,
    listPlans,
    getPlan,
    addBenefitCategory,
    removeBenefitCategory,
    addExclusion,
    removeExclusion
};
