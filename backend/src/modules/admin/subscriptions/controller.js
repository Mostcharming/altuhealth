const { Op } = require('sequelize');
const { addAuditLog } = require('../../../utils/addAdminNotification');
const { getNextSubscriptionCode } = require('../../../utils/subscriptionCodeGenerator');

// ========== SUBSCRIPTION CONTROLLERS ==========

async function createSubscription(req, res, next) {
    try {
        const { Subscription } = req.models;
        const { companyId, mode, subsidiaryId, startDate, endDate, notes } = req.body || {};

        // Validate required fields
        if (!companyId) return res.fail('`companyId` is required', 400);
        if (!mode) return res.fail('`mode` is required', 400);
        if (!startDate) return res.fail('`startDate` is required', 400);
        if (!endDate) return res.fail('`endDate` is required', 400);

        // Validate mode
        if (!['parent_only', 'parent_and_subsidiaries'].includes(mode)) {
            return res.fail('Invalid `mode`. Must be one of: parent_only, parent_and_subsidiaries', 400);
        }

        // Validate dates
        if (new Date(startDate) >= new Date(endDate)) {
            return res.fail('`startDate` must be before `endDate`', 400);
        }

        // Generate subscription code
        const code = await getNextSubscriptionCode(Subscription);

        const subscription = await Subscription.create({
            code,
            companyId,
            mode,
            subsidiaryId: mode === 'parent_only' ? subsidiaryId : null,
            startDate,
            endDate,
            notes
        });

        await addAuditLog(req.models, {
            action: 'subscription.create',
            message: `Subscription ${subscription.code} created`,
            userId: (req.user && req.user.id) ? req.user.id : null,
            userType: (req.user && req.user.type) ? req.user.type : null,
            meta: { subscriptionId: subscription.id }
        });

        return res.success({ subscription: subscription.toJSON() }, 'Subscription created', 201);
    } catch (err) {
        return next(err);
    }
}

async function updateSubscription(req, res, next) {
    try {
        const { Subscription } = req.models;
        const { id } = req.params;
        const { mode, subsidiaryId, startDate, endDate, notes, status } = req.body || {};

        const subscription = await Subscription.findByPk(id);
        if (!subscription) return res.fail('Subscription not found', 404);

        const updates = {};
        if (mode !== undefined) {
            if (!['parent_only', 'parent_and_subsidiaries'].includes(mode)) {
                return res.fail('Invalid `mode`. Must be one of: parent_only, parent_and_subsidiaries', 400);
            }
            updates.mode = mode;
        }

        if (subsidiaryId !== undefined) {
            updates.subsidiaryId = subsidiaryId;
        }

        if (startDate !== undefined || endDate !== undefined) {
            const newStartDate = startDate || subscription.startDate;
            const newEndDate = endDate || subscription.endDate;

            if (new Date(newStartDate) >= new Date(newEndDate)) {
                return res.fail('`startDate` must be before `endDate`', 400);
            }

            if (startDate !== undefined) updates.startDate = startDate;
            if (endDate !== undefined) updates.endDate = endDate;
        }

        if (notes !== undefined) updates.notes = notes;
        if (status !== undefined) {
            if (!['active', 'suspended', 'inactive', 'expired'].includes(status)) {
                return res.fail('Invalid `status`. Must be one of: active, suspended, inactive, expired', 400);
            }
            updates.status = status;
        }

        await subscription.update(updates);

        await addAuditLog(req.models, {
            action: 'subscription.update',
            message: `Subscription ${subscription.code} updated`,
            userId: (req.user && req.user.id) ? req.user.id : null,
            userType: (req.user && req.user.type) ? req.user.type : null,
            meta: { subscriptionId: subscription.id }
        });

        return res.success({ subscription }, 'Subscription updated');
    } catch (err) {
        return next(err);
    }
}

async function deleteSubscription(req, res, next) {
    try {
        const { Subscription } = req.models;
        const { id } = req.params;

        const subscription = await Subscription.findByPk(id);
        if (!subscription) return res.fail('Subscription not found', 404);

        const code = subscription.code;
        await subscription.destroy();

        await addAuditLog(req.models, {
            action: 'subscription.delete',
            message: `Subscription ${code} deleted`,
            userId: (req.user && req.user.id) ? req.user.id : null,
            userType: (req.user && req.user.type) ? req.user.type : null,
            meta: { subscriptionId: id }
        });

        return res.success(null, 'Subscription deleted');
    } catch (err) {
        return next(err);
    }
}

async function listSubscriptions(req, res, next) {
    try {
        const { Subscription } = req.models;
        const { limit = 10, page = 1, q, companyId, mode, status } = req.query;

        const isAll = String(limit).toLowerCase() === 'all';
        const limitNum = isAll ? 0 : Number(limit);
        const pageNum = isAll ? 1 : (Number(page) || 1);
        const offset = isAll ? 0 : (pageNum - 1) * limitNum;

        const where = {};

        // Search by code or company name
        if (q) {
            where[Op.or] = [
                { code: { [Op.iLike || Op.like]: `%${q}%` } },
                { '$Company.name$': { [Op.iLike || Op.like]: `%${q}%` } }
            ];
        }

        // Filter by company
        if (companyId) {
            where.companyId = companyId;
        }

        // Filter by mode
        if (mode) {
            where.mode = mode;
        }

        // Filter by status
        if (status !== undefined) {
            where.status = status;
        }

        const findOptions = {
            where,
            include: [
                {
                    association: 'Company',
                    attributes: ['id', 'name', 'email'],
                    required: !!q
                },
                {
                    association: 'CompanySubsidiary',
                    attributes: ['id', 'name', 'email']
                }
            ],
            order: [['createdAt', 'DESC']]
        };

        const total = await Subscription.count({ where, include: q ? [{ association: 'Company', required: true }] : [] });

        if (!isAll) {
            findOptions.limit = limitNum;
            findOptions.offset = Number(offset);
        }

        const subscriptions = await Subscription.findAll(findOptions);
        const data = subscriptions.map(s => s.toJSON());

        const hasPrevPage = !isAll && pageNum > 1;
        const hasNextPage = !isAll && (offset + subscriptions.length < total);
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

async function getSubscription(req, res, next) {
    try {
        const { Subscription } = req.models;
        const { id } = req.params;

        const subscription = await Subscription.findByPk(id, {
            include: [
                {
                    association: 'Company',
                    attributes: ['id', 'name', 'email', 'phoneNumber']
                },
                {
                    association: 'CompanySubsidiary',
                    attributes: ['id', 'name', 'email', 'phoneNumber']
                },
                {
                    association: 'companyPlans',
                    attributes: ['id', 'name', 'planCycle', 'annualPremiumPrice', 'isActive'],
                    through: { attributes: [] }
                }
            ]
        });

        if (!subscription) return res.fail('Subscription not found', 404);

        return res.success(subscription.toJSON());
    } catch (err) {
        return next(err);
    }
}

async function getModeOptions(req, res, next) {
    try {
        const modeOptions = [
            { value: 'parent_only', label: 'Parent Company Only' },
            { value: 'parent_and_subsidiaries', label: 'Parent Company & Subsidiaries' }
        ];
        return res.success({ modeOptions });
    } catch (err) {
        return next(err);
    }
}

// ========== SUBSCRIPTION PLAN CONTROLLERS ==========

async function addPlanToSubscription(req, res, next) {
    try {
        const { Subscription, SubscriptionPlan } = req.models;
        const { subscriptionId, companyPlanId } = req.body || {};

        if (!subscriptionId) return res.fail('`subscriptionId` is required', 400);
        if (!companyPlanId) return res.fail('`companyPlanId` is required', 400);

        // Verify subscription exists
        const subscription = await Subscription.findByPk(subscriptionId);
        if (!subscription) return res.fail('Subscription not found', 404);

        // Check if plan already linked
        const existing = await SubscriptionPlan.findOne({
            where: { subscriptionId, companyPlanId }
        });

        if (existing) {
            return res.fail('This plan is already linked to the subscription', 400);
        }

        const subscriptionPlan = await SubscriptionPlan.create({
            subscriptionId,
            companyPlanId
        });

        await addAuditLog(req.models, {
            action: 'subscription.addPlan',
            message: `Plan added to subscription ${subscription.code}`,
            userId: (req.user && req.user.id) ? req.user.id : null,
            userType: (req.user && req.user.type) ? req.user.type : null,
            meta: { subscriptionId, subscriptionPlanId: subscriptionPlan.id }
        });

        return res.success({ subscriptionPlan: subscriptionPlan.toJSON() }, 'Plan added to subscription', 201);
    } catch (err) {
        return next(err);
    }
}

async function removePlanFromSubscription(req, res, next) {
    try {
        const { SubscriptionPlan } = req.models;
        const { id } = req.params;

        const subscriptionPlan = await SubscriptionPlan.findByPk(id);
        if (!subscriptionPlan) return res.fail('Subscription plan link not found', 404);

        const { subscriptionId } = subscriptionPlan;
        await subscriptionPlan.destroy();

        await addAuditLog(req.models, {
            action: 'subscription.removePlan',
            message: `Plan removed from subscription`,
            userId: (req.user && req.user.id) ? req.user.id : null,
            userType: (req.user && req.user.type) ? req.user.type : null,
            meta: { subscriptionId, subscriptionPlanId: id }
        });

        return res.success(null, 'Plan removed from subscription');
    } catch (err) {
        return next(err);
    }
}

async function getSubscriptionPlans(req, res, next) {
    try {
        const { Subscription } = req.models;
        const { subscriptionId } = req.params;

        const subscription = await Subscription.findByPk(subscriptionId, {
            include: [
                {
                    association: 'companyPlans',
                    attributes: ['id', 'name', 'planCycle', 'annualPremiumPrice', 'isActive'],
                    through: { attributes: ['id', 'createdAt'] },
                    joinTableAttributes: ['id']
                }
            ]
        });

        if (!subscription) return res.fail('Subscription not found', 404);

        const plans = subscription.companyPlans.map(plan => ({
            ...plan.toJSON(),
            subscriptionPlanId: plan.SubscriptionPlan?.id
        }));

        return res.success({
            subscriptionId,
            plans,
            count: plans.length
        });
    } catch (err) {
        return next(err);
    }
}

async function listSubscriptionPlans(req, res, next) {
    try {
        const { SubscriptionPlan } = req.models;
        const { limit = 10, page = 1, subscriptionId } = req.query;

        const isAll = String(limit).toLowerCase() === 'all';
        const limitNum = isAll ? 0 : Number(limit);
        const pageNum = isAll ? 1 : (Number(page) || 1);
        const offset = isAll ? 0 : (pageNum - 1) * limitNum;

        const where = {};
        if (subscriptionId) {
            where.subscriptionId = subscriptionId;
        }

        const total = await SubscriptionPlan.count({ where });

        const findOptions = {
            where,
            include: [
                {
                    association: 'Subscription',
                    attributes: ['id', 'code', 'mode', 'startDate', 'endDate']
                },
                {
                    association: 'CompanyPlan',
                    attributes: ['id', 'name', 'planCycle', 'annualPremiumPrice']
                }
            ],
            order: [['createdAt', 'DESC']]
        };

        if (!isAll) {
            findOptions.limit = limitNum;
            findOptions.offset = Number(offset);
        }

        const subscriptionPlans = await SubscriptionPlan.findAll(findOptions);
        const data = subscriptionPlans.map(sp => sp.toJSON());

        const hasPrevPage = !isAll && pageNum > 1;
        const hasNextPage = !isAll && (offset + subscriptionPlans.length < total);
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

module.exports = {
    // Subscription
    createSubscription,
    updateSubscription,
    deleteSubscription,
    listSubscriptions,
    getSubscription,
    getModeOptions,
    // Subscription Plans
    addPlanToSubscription,
    removePlanFromSubscription,
    getSubscriptionPlans,
    listSubscriptionPlans
};
