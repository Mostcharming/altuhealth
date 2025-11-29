'use strict';

const { Op } = require('sequelize');
const { addAuditLog } = require('../../../utils/addAdminNotification');
const { createAdminApproval } = require('../../../utils/adminApproval');
const { generateProviderCode, generateProviderUPN } = require('../../../utils/providerCodeGenerator');

async function createProvider(req, res, next) {
    try {
        const { Provider, Admin, ProviderSpecialization, Plan, ProviderPlan } = req.models;
        const {
            name,
            category,
            email,
            phoneNumber,
            secondaryPhoneNumber,
            website,
            country,
            state,
            lga,
            address,
            providerArea,
            bank,
            accountName,
            accountNumber,
            bankBranch,
            paymentBatch,
            managerId,
            providerSpecializationId,
            planIds = []
        } = req.body || {};

        // Validate required fields
        if (!name) return res.fail('`name` is required', 400);
        if (!category) return res.fail('`category` is required', 400);
        if (!email) return res.fail('`email` is required', 400);
        if (!phoneNumber) return res.fail('`phoneNumber` is required', 400);
        if (!country) return res.fail('`country` is required', 400);
        if (!state) return res.fail('`state` is required', 400);
        if (!lga) return res.fail('`lga` is required', 400);
        if (!address) return res.fail('`address` is required', 400);
        if (!bank) return res.fail('`bank` is required', 400);
        if (!accountName) return res.fail('`accountName` is required', 400);
        if (!accountNumber) return res.fail('`accountNumber` is required', 400);
        if (!managerId) return res.fail('`managerId` is required', 400);

        // Verify manager exists
        const manager = await Admin.findByPk(managerId);
        if (!manager) return res.fail('Manager (Admin) not found', 404);

        // Verify provider specialization exists if provided
        if (providerSpecializationId) {
            const specialization = await ProviderSpecialization.findByPk(providerSpecializationId);
            if (!specialization) return res.fail('Provider Specialization not found', 404);
        }

        // Check for duplicate email
        const existingEmail = await Provider.findOne({ where: { email } });
        if (existingEmail) return res.fail('Email already exists', 400);

        // Check for duplicate account number
        const existingAccount = await Provider.findOne({ where: { accountNumber } });
        if (existingAccount) return res.fail('Account number already exists', 400);

        // Generate provider code and UPN
        let providerCode;
        let providerUPN;
        let codeExists = true;
        let upnExists = true;
        let attempts = 0;
        const maxAttempts = 10;

        // Retry logic to ensure unique code and UPN
        while ((codeExists || upnExists) && attempts < maxAttempts) {
            providerCode = generateProviderCode(country, state, lga);
            providerUPN = generateProviderUPN();

            const existingCode = await Provider.findOne({ where: { code: providerCode } });
            const existingUPN = await Provider.findOne({ where: { upn: providerUPN } });

            codeExists = !!existingCode;
            upnExists = !!existingUPN;
            attempts++;
        }

        if (codeExists || upnExists) {
            return res.fail('Failed to generate unique provider code or UPN', 500);
        }

        // Create provider
        const provider = await Provider.create({
            name,
            category,
            email,
            phoneNumber,
            secondaryPhoneNumber,
            website,
            country,
            state,
            lga,
            address,
            providerArea,
            bank,
            accountName,
            accountNumber,
            bankBranch,
            paymentBatch: paymentBatch || 'batch_a',
            managerId,
            providerSpecializationId,
            code: providerCode,
            upn: providerUPN,
            status: 'pending_approval'
        });

        // Associate plans if provided
        if (Array.isArray(planIds) && planIds.length > 0) {
            const plans = await Plan.findAll({ where: { id: planIds } });
            if (plans.length > 0) {
                await provider.addPlans(plans);
            }
        }

        await addAuditLog(req.models, {
            action: 'provider.create',
            message: `Provider ${provider.name} created`,
            userId: (req.user && req.user.id) ? req.user.id : null,
            userType: (req.user && req.user.type) ? req.user.type : null,
            meta: { providerId: provider.id }
        });

        // Create an admin approval record for this provider and notify admins
        (async () => {
            try {
                const requestedBy = (req.user && req.user.id) ? req.user.id : 'system';
                const requestedByType = (req.user && req.user.type) ? req.user.type : 'Admin';

                await createAdminApproval(req.models, {
                    model: 'Provider',
                    modelId: provider.id,
                    action: 'create',
                    details: JSON.stringify({
                        name,
                        category,
                        email,
                        state,
                        address,
                        bank,
                        accountNumber
                    }),
                    requestedBy,
                    requestedByType,
                    comments: null,
                    meta: { providerName: name }
                });
            } catch (err) {
                // don't fail the main request if approval creation fails
                if (console && console.warn) console.warn('Failed to create admin approval for provider:', err.message || err);
            }
        })();

        const providerData = provider.toJSON();

        return res.success({ provider: providerData }, 'Provider created', 201);
    } catch (err) {
        return next(err);
    }
}

async function updateProvider(req, res, next) {
    try {
        const { Provider, Admin, ProviderSpecialization, Plan } = req.models;
        const { id } = req.params;
        const {
            name,
            category,
            email,
            phoneNumber,
            secondaryPhoneNumber,
            website,
            country,
            state,
            lga,
            address,
            providerArea,
            bank,
            accountName,
            accountNumber,
            bankBranch,
            paymentBatch,
            managerId,
            providerSpecializationId,
            status,
            planIds
        } = req.body || {};

        const provider = await Provider.findByPk(id);
        if (!provider) return res.fail('Provider not found', 404);

        const updates = {};

        if (name !== undefined) updates.name = name;
        if (category !== undefined) updates.category = category;
        if (phoneNumber !== undefined) updates.phoneNumber = phoneNumber;
        if (secondaryPhoneNumber !== undefined) updates.secondaryPhoneNumber = secondaryPhoneNumber;
        if (website !== undefined) updates.website = website;
        if (country !== undefined) updates.country = country;
        if (state !== undefined) updates.state = state;
        if (lga !== undefined) updates.lga = lga;
        if (address !== undefined) updates.address = address;
        if (providerArea !== undefined) updates.providerArea = providerArea;
        if (bank !== undefined) updates.bank = bank;
        if (accountName !== undefined) updates.accountName = accountName;
        if (bankBranch !== undefined) updates.bankBranch = bankBranch;
        if (paymentBatch !== undefined) updates.paymentBatch = paymentBatch;
        if (status !== undefined) updates.status = status;

        // Note: code and upn cannot be updated as they are auto-generated

        // Handle email update with uniqueness check
        if (email !== undefined && email !== provider.email) {
            const existingEmail = await Provider.findOne({ where: { email, id: { [Op.ne]: id } } });
            if (existingEmail) return res.fail('Email already exists', 400);
            updates.email = email;
        }

        // Handle account number update with uniqueness check
        if (accountNumber !== undefined && accountNumber !== provider.accountNumber) {
            const existingAccount = await Provider.findOne({ where: { accountNumber, id: { [Op.ne]: id } } });
            if (existingAccount) return res.fail('Account number already exists', 400);
            updates.accountNumber = accountNumber;
        }

        // Handle manager update with validation
        if (managerId !== undefined && managerId !== provider.managerId) {
            const manager = await Admin.findByPk(managerId);
            if (!manager) return res.fail('Manager (Admin) not found', 404);
            updates.managerId = managerId;
        }

        // Handle provider specialization update
        if (providerSpecializationId !== undefined) {
            if (providerSpecializationId === null) {
                updates.providerSpecializationId = null;
            } else {
                const specialization = await ProviderSpecialization.findByPk(providerSpecializationId);
                if (!specialization) return res.fail('Provider Specialization not found', 404);
                updates.providerSpecializationId = providerSpecializationId;
            }
        }

        await provider.update(updates);

        // Handle plan updates if provided
        if (Array.isArray(planIds)) {
            const plans = await Plan.findAll({ where: { id: planIds } });
            await provider.setPlans(plans);
        }

        await addAuditLog(req.models, {
            action: 'provider.update',
            message: `Provider ${provider.name} updated`,
            userId: (req.user && req.user.id) ? req.user.id : null,
            userType: (req.user && req.user.type) ? req.user.type : null,
            meta: { providerId: provider.id }
        });

        return res.success({ provider }, 'Provider updated');
    } catch (err) {
        return next(err);
    }
}

async function deleteProvider(req, res, next) {
    try {
        const { Provider } = req.models;
        const { id } = req.params;

        const provider = await Provider.findByPk(id);
        if (!provider) return res.fail('Provider not found', 404);

        await provider.destroy();

        await addAuditLog(req.models, {
            action: 'provider.delete',
            message: `Provider ${provider.name} deleted`,
            userId: (req.user && req.user.id) ? req.user.id : null,
            userType: (req.user && req.user.type) ? req.user.type : null,
            meta: { providerId: id }
        });

        return res.success(null, 'Provider deleted');
    } catch (err) {
        return next(err);
    }
}

async function listProviders(req, res, next) {
    try {
        const { Provider, Admin, ProviderSpecialization, Plan } = req.models;
        const { limit = 10, page = 1, q, state, category, status } = req.query;

        const isAll = String(limit).toLowerCase() === 'all';
        const limitNum = isAll ? 0 : Number(limit);
        const pageNum = isAll ? 1 : (Number(page) || 1);
        const offset = isAll ? 0 : (pageNum - 1) * limitNum;

        const where = {};

        if (q) {
            where[Op.or] = [
                { name: { [Op.iLike || Op.like]: `%${q}%` } },
                { email: { [Op.iLike || Op.like]: `%${q}%` } },
                { address: { [Op.iLike || Op.like]: `%${q}%` } }
            ];
        }

        if (state) where.state = state;
        if (category) where.category = category;
        if (status) where.status = status;

        const total = await Provider.count({ where });

        const findOptions = {
            where,
            include: [
                {
                    model: Admin,
                    as: 'manager',
                    attributes: ['id', 'firstName', 'lastName', 'email']
                },
                {
                    model: ProviderSpecialization,
                    attributes: ['id', 'name', 'description']
                },
                {
                    model: Plan,
                    attributes: ['id', 'name', 'code'],
                    through: { attributes: [] }
                }
            ],
            order: [['created_at', 'DESC']]
        };

        if (!isAll) {
            findOptions.limit = limitNum;
            findOptions.offset = Number(offset);
        }

        const providers = await Provider.findAll(findOptions);
        const data = providers.map(p => p.toJSON());

        const hasPrevPage = !isAll && pageNum > 1;
        const hasNextPage = !isAll && (offset + providers.length < total);
        const totalPages = isAll ? 1 : (limitNum > 0 ? Math.ceil(total / limitNum) : 1);

        return res.success({ list: data, count: total, page: pageNum, limit: isAll ? 'all' : limitNum, totalPages, hasNextPage, hasPrevPage });
    } catch (err) {
        return next(err);
    }
}

async function getProvider(req, res, next) {
    try {
        const { Provider, Admin, ProviderSpecialization, Plan } = req.models;
        const { id } = req.params;

        const provider = await Provider.findByPk(id, {
            include: [
                {
                    model: Admin,
                    as: 'manager',
                    attributes: ['id', 'firstName', 'lastName', 'email', 'phoneNumber']
                },
                {
                    model: ProviderSpecialization,
                    attributes: ['id', 'name', 'description']
                },
                {
                    model: Plan,
                    attributes: ['id', 'name', 'code', 'description'],
                    through: { attributes: [] }
                }
            ]
        });

        if (!provider) return res.fail('Provider not found', 404);

        return res.success(provider.toJSON());
    } catch (err) {
        return next(err);
    }
}

async function addPlanToProvider(req, res, next) {
    try {
        const { Provider, Plan } = req.models;
        const { id } = req.params;
        const { planIds } = req.body || {};

        // Accept both single planId and multiple planIds
        let planIdArray = [];
        if (planIds && Array.isArray(planIds)) {
            planIdArray = planIds;
        } else if (planIds && !Array.isArray(planIds)) {
            planIdArray = [planIds];
        }

        if (!planIdArray || planIdArray.length === 0) return res.fail('`planIds` array is required', 400);

        const provider = await Provider.findByPk(id);
        if (!provider) return res.fail('Provider not found', 404);

        const plans = await Plan.findAll({ where: { id: planIdArray } });
        if (plans.length === 0) return res.fail('No valid plans found', 404);

        if (plans.length !== planIdArray.length) {
            return res.fail(`${planIdArray.length - plans.length} plan(s) not found`, 404);
        }

        await provider.addPlans(plans);

        const planNames = plans.map(p => p.name).join(', ');
        await addAuditLog(req.models, {
            action: 'provider.addPlans',
            message: `Plans (${planNames}) added to Provider ${provider.name}`,
            userId: (req.user && req.user.id) ? req.user.id : null,
            userType: (req.user && req.user.type) ? req.user.type : null,
            meta: { providerId: provider.id, planIds: plans.map(p => p.id) }
        });

        return res.success({ addedPlans: plans.map(p => ({ id: p.id, name: p.name })) }, 'Plans added to provider', 201);
    } catch (err) {
        return next(err);
    }
}

async function removePlanFromProvider(req, res, next) {
    try {
        const { Provider, Plan } = req.models;
        const { id } = req.params;
        const { planIds } = req.body || {};

        // Accept both single planId and multiple planIds
        let planIdArray = [];
        if (planIds && Array.isArray(planIds)) {
            planIdArray = planIds;
        } else if (planIds && !Array.isArray(planIds)) {
            planIdArray = [planIds];
        }

        if (!planIdArray || planIdArray.length === 0) return res.fail('`planIds` array is required', 400);

        const provider = await Provider.findByPk(id);
        if (!provider) return res.fail('Provider not found', 404);

        const plans = await Plan.findAll({ where: { id: planIdArray } });
        if (plans.length === 0) return res.fail('No valid plans found', 404);

        if (plans.length !== planIdArray.length) {
            return res.fail(`${planIdArray.length - plans.length} plan(s) not found`, 404);
        }

        await provider.removePlans(plans);

        const planNames = plans.map(p => p.name).join(', ');
        await addAuditLog(req.models, {
            action: 'provider.removePlans',
            message: `Plans (${planNames}) removed from Provider ${provider.name}`,
            userId: (req.user && req.user.id) ? req.user.id : null,
            userType: (req.user && req.user.type) ? req.user.type : null,
            meta: { providerId: provider.id, planIds: plans.map(p => p.id) }
        });

        return res.success({ removedPlans: plans.map(p => ({ id: p.id, name: p.name })) }, 'Plans removed from provider');
    } catch (err) {
        return next(err);
    }
}

module.exports = {
    createProvider,
    updateProvider,
    deleteProvider,
    listProviders,
    getProvider,
    addPlanToProvider,
    removePlanFromProvider
};
