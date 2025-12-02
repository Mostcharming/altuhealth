'use strict';

const { Op } = require('sequelize');
const { addAuditLog } = require('../../../utils/addAdminNotification');

async function createCompanyPlan(req, res, next) {
    try {
        const { CompanyPlan } = req.models;
        const {
            companyId,
            planId,
            name,
            ageLimit,
            dependentAgeLimit,
            maxNumberOfDependents,
            discountPerEnrolee,
            planCycle,
            annualPremiumPrice,
            description,
            allowDependentEnrolee
        } = req.body || {};

        if (!companyId) return res.fail('`companyId` is required', 400);
        if (!planId) return res.fail('`planId` is required', 400);
        if (!name) return res.fail('`name` is required', 400);
        if (!planCycle) return res.fail('`planCycle` is required', 400);
        if (annualPremiumPrice === undefined || annualPremiumPrice === null) {
            return res.fail('`annualPremiumPrice` is required', 400);
        }

        const companyPlan = await CompanyPlan.create({
            companyId,
            planId,
            name,
            ageLimit,
            dependentAgeLimit,
            maxNumberOfDependents,
            discountPerEnrolee,
            planCycle,
            annualPremiumPrice,
            description,
            allowDependentEnrolee: allowDependentEnrolee !== undefined ? allowDependentEnrolee : true,
            isActive: true
        });

        await addAuditLog(req.models, {
            action: 'companyPlan.create',
            message: `Company Plan ${companyPlan.name} created`,
            userId: (req.user && req.user.id) ? req.user.id : null,
            userType: (req.user && req.user.type) ? req.user.type : null,
            meta: { companyPlanId: companyPlan.id, companyId }
        });

        return res.success({ companyPlan: companyPlan.toJSON() }, 'Company Plan created', 201);
    } catch (err) {
        return next(err);
    }
}

async function updateCompanyPlan(req, res, next) {
    try {
        const { CompanyPlan } = req.models;
        const { id } = req.params;
        const {
            planId,
            name,
            ageLimit,
            dependentAgeLimit,
            maxNumberOfDependents,
            discountPerEnrolee,
            planCycle,
            annualPremiumPrice,
            description,
            allowDependentEnrolee,
            isActive
        } = req.body || {};

        const companyPlan = await CompanyPlan.findByPk(id);
        if (!companyPlan) return res.fail('Company Plan not found', 404);

        const updates = {};
        if (planId !== undefined) updates.planId = planId;
        if (name !== undefined) updates.name = name;
        if (ageLimit !== undefined) updates.ageLimit = ageLimit;
        if (dependentAgeLimit !== undefined) updates.dependentAgeLimit = dependentAgeLimit;
        if (maxNumberOfDependents !== undefined) updates.maxNumberOfDependents = maxNumberOfDependents;
        if (discountPerEnrolee !== undefined) updates.discountPerEnrolee = discountPerEnrolee;
        if (planCycle !== undefined) updates.planCycle = planCycle;
        if (annualPremiumPrice !== undefined) updates.annualPremiumPrice = annualPremiumPrice;
        if (description !== undefined) updates.description = description;
        if (allowDependentEnrolee !== undefined) updates.allowDependentEnrolee = allowDependentEnrolee;
        if (isActive !== undefined) updates.isActive = isActive;

        await companyPlan.update(updates);

        await addAuditLog(req.models, {
            action: 'companyPlan.update',
            message: `Company Plan ${companyPlan.name} updated`,
            userId: (req.user && req.user.id) ? req.user.id : null,
            userType: (req.user && req.user.type) ? req.user.type : null,
            meta: { companyPlanId: companyPlan.id }
        });

        return res.success({ companyPlan }, 'Company Plan updated');
    } catch (err) {
        return next(err);
    }
}

async function deleteCompanyPlan(req, res, next) {
    try {
        const { CompanyPlan } = req.models;
        const { id } = req.params;

        const companyPlan = await CompanyPlan.findByPk(id);
        if (!companyPlan) return res.fail('Company Plan not found', 404);

        await companyPlan.destroy();

        await addAuditLog(req.models, {
            action: 'companyPlan.delete',
            message: `Company Plan ${companyPlan.name} deleted`,
            userId: (req.user && req.user.id) ? req.user.id : null,
            userType: (req.user && req.user.type) ? req.user.type : null,
            meta: { companyPlanId: id }
        });

        return res.success(null, 'Company Plan deleted');
    } catch (err) {
        return next(err);
    }
}

async function listCompanyPlans(req, res, next) {
    try {
        const { CompanyPlan, Plan } = req.models;
        const { limit = 10, page = 1, q, companyId, isActive, planId } = req.query;

        const isAll = String(limit).toLowerCase() === 'all';
        const limitNum = isAll ? 0 : Number(limit);
        const pageNum = isAll ? 1 : (Number(page) || 1);
        const offset = isAll ? 0 : (pageNum - 1) * limitNum;

        const where = {};

        if (companyId) {
            where.companyId = companyId;
        }

        if (q) {
            where[Op.or] = [
                { name: { [Op.iLike || Op.like]: `%${q}%` } },
                { description: { [Op.iLike || Op.like]: `%${q}%` } }
            ];
        }

        if (isActive !== undefined) {
            where.isActive = isActive === 'true' || isActive === true;
        }

        if (planId) {
            where.planId = planId;
        }

        const total = await CompanyPlan.count({ where });

        const findOptions = {
            where,
            order: [['created_at', 'DESC']],
            include: [
                {
                    model: Plan,
                    attributes: ['id', 'name', 'code'],
                    required: false
                }
            ]
        };

        if (!isAll) {
            findOptions.limit = limitNum;
            findOptions.offset = Number(offset);
        }

        const companyPlans = await CompanyPlan.findAll(findOptions);
        const data = companyPlans.map(cp => cp.toJSON());

        const hasPrevPage = !isAll && pageNum > 1;
        const hasNextPage = !isAll && (offset + companyPlans.length < total);
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

async function getCompanyPlan(req, res, next) {
    try {
        const { CompanyPlan, Plan, BenefitCategory, Exclusion, Provider } = req.models;
        const { id } = req.params;
        const { include } = req.query;

        const includes = [];

        // Always include Plan
        includes.push({
            model: Plan,
            attributes: ['id', 'name', 'code'],
            required: false
        });

        // Optionally include other models based on query parameter
        if (include) {
            const requestedIncludes = String(include).split(',').map(i => i.trim());

            if (requestedIncludes.includes('benefitCategories')) {
                includes.push({
                    model: BenefitCategory,
                    as: 'benefitCategories',
                    attributes: ['id', 'name'],
                    required: false,
                    through: { attributes: [] }
                });
            }

            if (requestedIncludes.includes('exclusions')) {
                includes.push({
                    model: Exclusion,
                    as: 'exclusions',
                    attributes: ['id', 'description'],
                    required: false,
                    through: { attributes: [] }
                });
            }

            if (requestedIncludes.includes('providers')) {
                includes.push({
                    model: Provider,
                    as: 'providers',
                    attributes: ['id', 'name'],
                    required: false,
                    through: { attributes: [] }
                });
            }
        }

        const companyPlan = await CompanyPlan.findByPk(id, {
            include: includes
        });
        if (!companyPlan) return res.fail('Company Plan not found', 404);

        return res.success(companyPlan.toJSON());
    } catch (err) {
        return next(err);
    }
}

// Add benefit category to company plan
async function addBenefitCategory(req, res, next) {
    try {
        const { CompanyPlan, CompanyPlanBenefitCategory } = req.models;
        const { companyPlanId, benefitCategoryId } = req.body || {};

        if (!companyPlanId) return res.fail('`companyPlanId` is required', 400);
        if (!benefitCategoryId) return res.fail('`benefitCategoryId` is required', 400);

        const companyPlan = await CompanyPlan.findByPk(companyPlanId);
        if (!companyPlan) return res.fail('Company Plan not found', 404);

        // Check if already exists
        const existing = await CompanyPlanBenefitCategory.findOne({
            where: { companyPlanId, benefitCategoryId }
        });
        if (existing) return res.fail('Benefit category already added to this plan', 400);

        const record = await CompanyPlanBenefitCategory.create({
            companyPlanId,
            benefitCategoryId
        });

        await addAuditLog(req.models, {
            action: 'companyPlan.addBenefitCategory',
            message: `Benefit category added to company plan`,
            userId: (req.user && req.user.id) ? req.user.id : null,
            userType: (req.user && req.user.type) ? req.user.type : null,
            meta: { companyPlanId, benefitCategoryId }
        });

        return res.success({ record: record.toJSON() }, 'Benefit category added', 201);
    } catch (err) {
        return next(err);
    }
}

// Remove benefit category from company plan
async function removeBenefitCategory(req, res, next) {
    try {
        const { CompanyPlanBenefitCategory } = req.models;
        const { companyPlanId, benefitCategoryId } = req.params;

        const record = await CompanyPlanBenefitCategory.findOne({
            where: { companyPlanId, benefitCategoryId }
        });
        if (!record) return res.fail('Benefit category not found in this plan', 404);

        await record.destroy();

        await addAuditLog(req.models, {
            action: 'companyPlan.removeBenefitCategory',
            message: `Benefit category removed from company plan`,
            userId: (req.user && req.user.id) ? req.user.id : null,
            userType: (req.user && req.user.type) ? req.user.type : null,
            meta: { companyPlanId, benefitCategoryId }
        });

        return res.success(null, 'Benefit category removed');
    } catch (err) {
        return next(err);
    }
}

// Add exclusion to company plan
async function addExclusion(req, res, next) {
    try {
        const { CompanyPlan, CompanyPlanExclusion } = req.models;
        const { companyPlanId, exclusionId } = req.body || {};

        if (!companyPlanId) return res.fail('`companyPlanId` is required', 400);
        if (!exclusionId) return res.fail('`exclusionId` is required', 400);

        const companyPlan = await CompanyPlan.findByPk(companyPlanId);
        if (!companyPlan) return res.fail('Company Plan not found', 404);

        // Check if already exists
        const existing = await CompanyPlanExclusion.findOne({
            where: { companyPlanId, exclusionId }
        });
        if (existing) return res.fail('Exclusion already added to this plan', 400);

        const record = await CompanyPlanExclusion.create({
            companyPlanId,
            exclusionId
        });

        await addAuditLog(req.models, {
            action: 'companyPlan.addExclusion',
            message: `Exclusion added to company plan`,
            userId: (req.user && req.user.id) ? req.user.id : null,
            userType: (req.user && req.user.type) ? req.user.type : null,
            meta: { companyPlanId, exclusionId }
        });

        return res.success({ record: record.toJSON() }, 'Exclusion added', 201);
    } catch (err) {
        return next(err);
    }
}

// Remove exclusion from company plan
async function removeExclusion(req, res, next) {
    try {
        const { CompanyPlanExclusion } = req.models;
        const { companyPlanId, exclusionId } = req.params;

        const record = await CompanyPlanExclusion.findOne({
            where: { companyPlanId, exclusionId }
        });
        if (!record) return res.fail('Exclusion not found in this plan', 404);

        await record.destroy();

        await addAuditLog(req.models, {
            action: 'companyPlan.removeExclusion',
            message: `Exclusion removed from company plan`,
            userId: (req.user && req.user.id) ? req.user.id : null,
            userType: (req.user && req.user.type) ? req.user.type : null,
            meta: { companyPlanId, exclusionId }
        });

        return res.success(null, 'Exclusion removed');
    } catch (err) {
        return next(err);
    }
}

// Add provider to company plan
async function addProvider(req, res, next) {
    try {
        const { CompanyPlan, CompanyPlanProvider } = req.models;
        const { companyPlanId, providerId } = req.body || {};

        if (!companyPlanId) return res.fail('`companyPlanId` is required', 400);
        if (!providerId) return res.fail('`providerId` is required', 400);

        const companyPlan = await CompanyPlan.findByPk(companyPlanId);
        if (!companyPlan) return res.fail('Company Plan not found', 404);

        // Check if already exists
        const existing = await CompanyPlanProvider.findOne({
            where: { companyPlanId, providerId }
        });
        if (existing) return res.fail('Provider already added to this plan', 400);

        const record = await CompanyPlanProvider.create({
            companyPlanId,
            providerId
        });

        await addAuditLog(req.models, {
            action: 'companyPlan.addProvider',
            message: `Provider added to company plan`,
            userId: (req.user && req.user.id) ? req.user.id : null,
            userType: (req.user && req.user.type) ? req.user.type : null,
            meta: { companyPlanId, providerId }
        });

        return res.success({ record: record.toJSON() }, 'Provider added', 201);
    } catch (err) {
        return next(err);
    }
}

// Remove provider from company plan
async function removeProvider(req, res, next) {
    try {
        const { CompanyPlanProvider } = req.models;
        const { companyPlanId, providerId } = req.params;

        const record = await CompanyPlanProvider.findOne({
            where: { companyPlanId, providerId }
        });
        if (!record) return res.fail('Provider not found in this plan', 404);

        await record.destroy();

        await addAuditLog(req.models, {
            action: 'companyPlan.removeProvider',
            message: `Provider removed from company plan`,
            userId: (req.user && req.user.id) ? req.user.id : null,
            userType: (req.user && req.user.type) ? req.user.type : null,
            meta: { companyPlanId, providerId }
        });

        return res.success(null, 'Provider removed');
    } catch (err) {
        return next(err);
    }
}

module.exports = {
    createCompanyPlan,
    updateCompanyPlan,
    deleteCompanyPlan,
    listCompanyPlans,
    getCompanyPlan,
    addBenefitCategory,
    removeBenefitCategory,
    addExclusion,
    removeExclusion,
    addProvider,
    removeProvider
};
