const { Sequelize, Op } = require('sequelize');

function exactMatchWhere(modelName, field, searchTerm) {
    return Sequelize.where(
        Sequelize.fn('LOWER', Sequelize.col(`${modelName}.${field}`)),
        Sequelize.Op.eq,
        String(searchTerm).toLowerCase()
    );
}

async function providerSupportsPlan(ProviderPlan, providerId, planId) {
    if (!planId) return false;

    const providerPlan = await ProviderPlan.findOne({
        where: { providerId, planId },
        attributes: ['id'],
        raw: true
    });

    return Boolean(providerPlan);
}

async function getCorporateCoveragePlans(models, enrollee) {
    const { Staff, SubscriptionPlan, CompanyPlan } = models;
    const coverages = new Map();

    const addCoverage = (companyPlan) => {
        if (!companyPlan?.id) return;
        coverages.set(companyPlan.id, {
            companyPlanId: companyPlan.id,
            planId: companyPlan.planId || null
        });
    };

    const staffId = enrollee?.staffId || enrollee?.Staff?.id;
    if (staffId) {
        const staff = await Staff.findByPk(staffId, {
            attributes: ['id', 'subscriptionId'],
            raw: true
        });

        if (staff?.subscriptionId) {
            const subscriptionPlans = await SubscriptionPlan.findAll({
                where: { subscriptionId: staff.subscriptionId },
                include: [
                    {
                        model: CompanyPlan,
                        attributes: ['id', 'planId'],
                        required: true
                    }
                ]
            });

            subscriptionPlans.forEach((subscriptionPlan) => {
                addCoverage(subscriptionPlan.CompanyPlan);
            });
        }
    }

    if (enrollee?.companyPlanId) {
        const companyPlan = await CompanyPlan.findByPk(enrollee.companyPlanId, {
            attributes: ['id', 'planId'],
            raw: true
        });
        addCoverage(companyPlan);
    }

    return Array.from(coverages.values());
}

async function getRetailPlanIds(models, retailEnrolleeId) {
    const { RetailEnrolleeSubscription } = models;
    if (!retailEnrolleeId) return [];

    const subscriptions = await RetailEnrolleeSubscription.findAll({
        where: {
            retailEnrolleeId,
            status: 'active'
        },
        attributes: ['id', 'planId'],
        order: [['subscriptionStartDate', 'DESC']],
        raw: true
    });

    return [...new Set(subscriptions.map((subscription) => subscription.planId).filter(Boolean))];
}

async function ensureProviderSupportsAnyPlan(models, providerId, planIds) {
    const { ProviderPlan } = models;

    for (const planId of planIds) {
        const supported = await providerSupportsPlan(ProviderPlan, providerId, planId);
        if (supported) return true;
    }

    return false;
}

async function ensureProviderSupportsAnyCorporateCoverage(models, providerId, coverages) {
    const { ProviderPlan, CompanyPlanProvider } = models;

    for (const coverage of coverages) {
        if (coverage.planId) {
            const supported = await providerSupportsPlan(ProviderPlan, providerId, coverage.planId);
            if (supported) return true;
            continue;
        }

        if (coverage.companyPlanId) {
            const supportedCustomPlan = await CompanyPlanProvider.findOne({
                where: {
                    providerId,
                    companyPlanId: coverage.companyPlanId
                },
                attributes: ['id'],
                raw: true
            });

            if (supportedCustomPlan) return true;
        }
    }

    return false;
}

async function findMember(models, searchTerm, isEmail) {
    const {
        Enrollee,
        EnrolleeDependent,
        RetailEnrollee,
        RetailEnrolleeDependent,
        Staff,
        Company,
        CompanyPlan
    } = models;
    const lowerSearchTerm = String(searchTerm).toLowerCase();

    const enrolleeWhere = isEmail
        ? exactMatchWhere('Enrollee', 'email', lowerSearchTerm)
        : exactMatchWhere('Enrollee', 'policy_number', lowerSearchTerm);

    const enrollee = await Enrollee.findOne({
        where: enrolleeWhere,
        include: [
            { model: Staff, attributes: ['id', 'firstName', 'lastName', 'staffId', 'email', 'phoneNumber', 'subscriptionId'] },
            { model: Company, attributes: ['id', 'name'] },
            { model: CompanyPlan, as: 'companyPlan', attributes: ['id', 'name', 'planId'] }
        ]
    });

    if (enrollee) {
        return { member: enrollee, memberType: 'enrollee', responseKey: 'enrollee' };
    }

    const dependentWhere = isEmail
        ? exactMatchWhere('EnrolleeDependent', 'email', lowerSearchTerm)
        : exactMatchWhere('EnrolleeDependent', 'policy_number', lowerSearchTerm);

    const dependent = await EnrolleeDependent.findOne({
        where: dependentWhere,
        include: [
            {
                model: Enrollee,
                attributes: ['id', 'firstName', 'lastName', 'policyNumber', 'email', 'phoneNumber', 'staffId', 'companyPlanId'],
                include: [
                    { model: Staff, attributes: ['id', 'subscriptionId'] },
                    { model: CompanyPlan, as: 'companyPlan', attributes: ['id', 'name', 'planId'] }
                ]
            }
        ]
    });

    if (dependent) {
        return { member: dependent, memberType: 'dependent', responseKey: 'dependent' };
    }

    const retailEnrolleeWhere = isEmail
        ? exactMatchWhere('RetailEnrollee', 'email', lowerSearchTerm)
        : exactMatchWhere('RetailEnrollee', 'policy_number', lowerSearchTerm);

    const retailEnrollee = await RetailEnrollee.findOne({
        where: retailEnrolleeWhere,
        include: [
            { association: 'subscriptions', attributes: ['id', 'planId', 'status', 'subscriptionStartDate', 'subscriptionEndDate'] }
        ]
    });

    if (retailEnrollee) {
        return { member: retailEnrollee, memberType: 'retail_enrollee', responseKey: 'enrollee' };
    }

    const retailDependentWhere = isEmail
        ? exactMatchWhere('RetailEnrolleeDependent', 'email', lowerSearchTerm)
        : exactMatchWhere('RetailEnrolleeDependent', 'policy_number', lowerSearchTerm);

    const retailDependent = await RetailEnrolleeDependent.findOne({
        where: retailDependentWhere,
        include: [
            {
                model: RetailEnrollee,
                attributes: ['id', 'firstName', 'lastName', 'policyNumber', 'email', 'phoneNumber'],
                include: [
                    { association: 'subscriptions', attributes: ['id', 'planId', 'status', 'subscriptionStartDate', 'subscriptionEndDate'] }
                ]
            }
        ]
    });

    if (retailDependent) {
        return { member: retailDependent, memberType: 'retail_dependent', responseKey: 'dependent' };
    }

    return null;
}

async function getMemberPlanIds(models, found) {
    if (found.memberType === 'enrollee') {
        return getCorporatePlanIds(models, found.member);
    }

    if (found.memberType === 'dependent') {
        return getCorporatePlanIds(models, found.member.Enrollee);
    }

    if (found.memberType === 'retail_enrollee') {
        return getRetailPlanIds(models, found.member.id);
    }

    if (found.memberType === 'retail_dependent') {
        return getRetailPlanIds(models, found.member.retailEnrolleeId || found.member.RetailEnrollee?.id);
    }

    return [];
}

async function providerSupportsMemberCoverage(models, providerId, found) {
    if (found.memberType === 'enrollee') {
        const coverages = await getCorporateCoveragePlans(models, found.member);
        return ensureProviderSupportsAnyCorporateCoverage(models, providerId, coverages);
    }

    if (found.memberType === 'dependent') {
        const coverages = await getCorporateCoveragePlans(models, found.member.Enrollee);
        return ensureProviderSupportsAnyCorporateCoverage(models, providerId, coverages);
    }

    const planIds = await getMemberPlanIds(models, found);
    return ensureProviderSupportsAnyPlan(models, providerId, planIds);
}

async function searchEnrolleeOrDependent(req, res, next) {
    try {
        const { Provider, SearchHistory } = req.models;
        const { searchTerm, provider_id } = req.body;
        const providerId = req.user?.id || provider_id;

        if (!searchTerm) {
            return res.status(400).json({
                success: false,
                message: 'Search term is required',
                errors: ['searchTerm field is required']
            });
        }

        if (!providerId) {
            return res.status(400).json({
                success: false,
                message: 'Provider ID is required',
                errors: ['provider_id field is required']
            });
        }

        const provider = await Provider.findByPk(providerId);
        if (!provider) {
            return res.status(404).json({
                success: false,
                message: 'Provider not found'
            });
        }

        const lowerSearchTerm = searchTerm.toLowerCase();
        const isEmail = lowerSearchTerm.includes('@');
        const searchType = isEmail ? 'email' : 'policyNumber';

        const found = await findMember(req.models, searchTerm, isEmail);
        if (!found) {
            return res.status(404).json({
                success: false,
                message: 'No enrollee, retail enrollee, dependent, or retail dependent found with the provided search term'
            });
        }

        const supportsPlan = await providerSupportsMemberCoverage(req.models, providerId, found);

        if (!supportsPlan) {
            return res.status(403).json({
                success: false,
                message: 'Provider does not support the plan on this member subscription'
            });
        }

        await SearchHistory.create({
            providerId,
            searchTerm,
        });

        return res.success(
            {
                [found.responseKey]: found.member,
                resultType: found.memberType,
                searchType
            },
            `${found.memberType.replace(/_/g, ' ')} found successfully`
        );

    } catch (error) {
        console.error('Error searching enrollee or dependent:', error);
        next(error);
    }
}

async function getSearchHistory(req, res, next) {
    try {
        const { SearchHistory, Provider } = req.models;
        const { provider_id } = req.query;

        if (!provider_id) {
            return res.status(400).json({
                success: false,
                message: 'Provider ID is required',
                errors: ['provider_id query parameter is required']
            });
        }

        const provider = await Provider.findByPk(provider_id);
        if (!provider) {
            return res.status(404).json({
                success: false,
                message: 'Provider not found'
            });
        }

        const rows = await SearchHistory.findAll({
            where: { providerId: provider_id },
            order: [['createdAt', 'DESC']],
            limit: 10,
        });

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        const categorized = {
            today: [],
            yesterday: [],
            earlier: []
        };

        rows.forEach(record => {
            const recordDate = new Date(record.createdAt);
            recordDate.setHours(0, 0, 0, 0);

            if (recordDate.getTime() === today.getTime()) {
                categorized.today.push(record);
            } else if (recordDate.getTime() === yesterday.getTime()) {
                categorized.yesterday.push(record);
            } else {
                categorized.earlier.push(record);
            }
        });

        return res.success(
            categorized,
            'Search history retrieved successfully'
        );

    } catch (error) {
        console.error('Error fetching search history:', error);
        next(error);
    }
}

async function lookupEnrollee(req, res, next) {
    try {
        const { Provider } = req.models;
        const { query, provider_id } = req.query;
        const providerId = req.user?.id || provider_id;

        if (!query) {
            return res.success(
                { enrollee: null },
                'Please enter a search query'
            );
        }

        if (!providerId) {
            return res.status(400).json({
                success: false,
                message: 'Provider ID is required',
                errors: ['provider_id query parameter is required']
            });
        }

        const provider = await Provider.findByPk(providerId);
        if (!provider) {
            return res.status(404).json({
                success: false,
                message: 'Provider not found'
            });
        }

        const isEmail = String(query).toLowerCase().includes('@');
        const found = await findMember(req.models, query, isEmail);

        if (!found) {
            return res.success(
                { enrollee: null, dependent: null },
                'No enrollee, retail enrollee, dependent, or retail dependent found'
            );
        }

        const supportsPlan = await providerSupportsMemberCoverage(req.models, providerId, found);

        if (!supportsPlan) {
            return res.status(403).json({
                success: false,
                message: 'Provider does not support the plan on this member subscription'
            });
        }

        return res.success(
            {
                [found.responseKey]: found.member,
                resultType: found.memberType
            },
            `${found.memberType.replace(/_/g, ' ')} found`
        );

    } catch (error) {
        console.error('Error looking up enrollee:', error);
        next(error);
    }
}


module.exports = {
    searchEnrolleeOrDependent,
    getSearchHistory,
    lookupEnrollee
};
