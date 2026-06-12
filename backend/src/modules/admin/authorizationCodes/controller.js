const { Op } = require('sequelize');
const { addAuditLog } = require('../../../utils/addAdminNotification');
const notify = require('../../../utils/notify');
const config = require('../../../config');

function toMoney(value) {
    const amount = Number(value || 0);
    return Number.isFinite(amount) ? amount : 0;
}

function memberName(member) {
    if (!member) return null;
    return [member.firstName, member.lastName].filter(Boolean).join(' ').trim() || null;
}

async function attachMember(models, data) {
    const { Enrollee, EnrolleeDependent, RetailEnrollee, RetailEnrolleeDependent } = models;
    let member = null;
    let memberType = null;

    if (data.enrolleeId) {
        member = await Enrollee.findByPk(data.enrolleeId, {
            attributes: ['id', 'firstName', 'lastName', 'policyNumber', 'email', 'phoneNumber']
        });
        memberType = 'enrollee';
    } else if (data.enrolleeDependentId) {
        member = await EnrolleeDependent.findByPk(data.enrolleeDependentId, {
            attributes: ['id', 'firstName', 'lastName', 'policyNumber', 'email', 'phoneNumber', 'enrolleeId']
        });
        memberType = 'dependent';
    } else if (data.retailEnrolleeId) {
        member = await RetailEnrollee.findByPk(data.retailEnrolleeId, {
            attributes: ['id', 'firstName', 'lastName', 'policyNumber', 'email', 'phoneNumber']
        });
        memberType = 'retail_enrollee';
    } else if (data.retailEnrolleeDependentId) {
        member = await RetailEnrolleeDependent.findByPk(data.retailEnrolleeDependentId, {
            attributes: ['id', 'firstName', 'lastName', 'policyNumber', 'email', 'phoneNumber', 'retailEnrolleeId']
        });
        memberType = 'retail_dependent';
    }

    data.member = member ? member.toJSON() : null;
    data.memberName = memberName(data.member);
    data.memberType = memberType;
    return data;
}

async function syncAuthorizationCodeReviewState(models, authorizationCodeId, transaction) {
    const { AuthorizationCode, AuthorizationCodeRendered } = models;
    const items = await AuthorizationCodeRendered.findAll({
        where: { authorizationCodeId },
        transaction
    });

    if (!items.length) return;

    const reviewedItems = items.filter((item) => item.status !== 'pending');
    const acceptedItems = items.filter((item) => ['approved', 'partial'].includes(item.status));
    const amountAuthorized = acceptedItems.reduce((sum, item) => {
        const amount = item.status === 'partial' ? item.approvedAmount : item.lineAmount;
        return sum + toMoney(amount);
    }, 0);

    const update = { amountAuthorized };

    if (reviewedItems.length === items.length) {
        update.status = acceptedItems.length ? 'active' : 'cancelled';
        update.dateTimeGiven = acceptedItems.length ? new Date() : null;
    } else {
        update.status = 'pending';
    }

    await AuthorizationCode.update(update, {
        where: { id: authorizationCodeId },
        transaction
    });
}

async function createAuthorizationCode(req, res, next) {
    try {
        const { AuthorizationCode, Enrollee, Provider, Diagnosis, Company, CompanyPlan, Admin } = req.models;
        const {
            enrolleeId,
            providerId,
            diagnosisId,
            companyId,
            companyPlanId,
            authorizationType,
            validFrom,
            validTo,
            amountAuthorized,
            reasonForCode,
            approvalNote,
            notes
        } = req.body || {};

        // Validate required fields
        if (!enrolleeId) return res.fail('`enrolleeId` is required', 400);
        if (!companyId) return res.fail('`companyId` is required', 400);
        if (!authorizationType) return res.fail('`authorizationType` is required', 400);
        if (!validFrom) return res.fail('`validFrom` is required', 400);
        if (!validTo) return res.fail('`validTo` is required', 400);

        // Validate enum values
        const validAuthorizationTypes = ['inpatient', 'outpatient', 'procedure', 'medication', 'diagnostic'];
        if (!validAuthorizationTypes.includes(authorizationType)) {
            return res.fail(`\`authorizationType\` must be one of: ${validAuthorizationTypes.join(', ')}`, 400);
        }

        // Validate dates
        const from = new Date(validFrom);
        const to = new Date(validTo);
        if (from >= to) {
            return res.fail('`validTo` must be after `validFrom`', 400);
        }

        // Verify enrollee exists
        const enrollee = await Enrollee.findByPk(enrolleeId);
        if (!enrollee) return res.fail('Enrollee not found', 404);

        // Verify company exists
        const company = await Company.findByPk(companyId);
        if (!company) return res.fail('Company not found', 404);

        // Verify provider exists if provided
        if (providerId) {
            const provider = await Provider.findByPk(providerId);
            if (!provider) return res.fail('Provider not found', 404);
        }

        // Verify diagnosis exists if provided
        if (diagnosisId) {
            const diagnosis = await Diagnosis.findByPk(diagnosisId);
            if (!diagnosis) return res.fail('Diagnosis not found', 404);
        }

        // Verify company plan exists if provided
        if (companyPlanId) {
            const plan = await CompanyPlan.findByPk(companyPlanId);
            if (!plan) return res.fail('Company plan not found', 404);
        }

        // Generate authorization code
        const authorizationCodeGenerator = require('../../../utils/authorizationCodeGenerator');
        const authCode = await authorizationCodeGenerator.getUniqueAuthorizationCode(AuthorizationCode);

        const authorizationCode = await AuthorizationCode.create({
            authorizationCode: authCode,
            enrolleeId,
            providerId: providerId || null,
            diagnosisId: diagnosisId || null,
            companyId,
            companyPlanId: companyPlanId || null,
            authorizationType,
            validFrom: from,
            validTo: to,
            amountAuthorized: amountAuthorized || null,
            reasonForCode: reasonForCode || null,
            approvalNote: approvalNote || null,
            notes: notes || null,
            status: 'active'
        });

        await addAuditLog(req.models, {
            action: 'authorization_code.create',
            message: `Authorization code ${authCode} created for enrollee ${enrolleeId}`,
            userId: (req.user && req.user.id) ? req.user.id : null,
            userType: (req.user && req.user.type) ? req.user.type : null,
            meta: { authorizationCodeId: authorizationCode.id, enrolleeId }
        });

        return res.success({ authorizationCode: authorizationCode.toJSON() }, 'Authorization code created', 201);
    } catch (err) {
        return next(err);
    }
}

async function updateAuthorizationCode(req, res, next) {
    try {
        const { AuthorizationCode, Provider, Diagnosis, CompanyPlan } = req.models;
        const { id } = req.params;
        const {
            providerId,
            diagnosisId,
            companyPlanId,
            validFrom,
            validTo,
            amountAuthorized,
            reasonForCode,
            approvalNote,
            notes,
            status
        } = req.body || {};

        const authCode = await AuthorizationCode.findByPk(id);
        if (!authCode) return res.fail('Authorization code not found', 404);

        // Validate status enum if provided
        const validStatuses = ['active', 'used', 'expired', 'cancelled', 'pending'];
        if (status && !validStatuses.includes(status)) {
            return res.fail(`\`status\` must be one of: ${validStatuses.join(', ')}`, 400);
        }

        // Validate dates if provided
        if (validFrom || validTo) {
            const from = validFrom ? new Date(validFrom) : authCode.validFrom;
            const to = validTo ? new Date(validTo) : authCode.validTo;
            if (from >= to) {
                return res.fail('`validTo` must be after `validFrom`', 400);
            }
        }

        // Verify provider exists if provided
        if (providerId) {
            const provider = await Provider.findByPk(providerId);
            if (!provider) return res.fail('Provider not found', 404);
        }

        // Verify diagnosis exists if provided
        if (diagnosisId) {
            const diagnosis = await Diagnosis.findByPk(diagnosisId);
            if (!diagnosis) return res.fail('Diagnosis not found', 404);
        }

        // Verify company plan exists if provided
        if (companyPlanId) {
            const plan = await CompanyPlan.findByPk(companyPlanId);
            if (!plan) return res.fail('Company plan not found', 404);
        }

        const updates = {};

        if (providerId !== undefined) updates.providerId = providerId || null;
        if (diagnosisId !== undefined) updates.diagnosisId = diagnosisId || null;
        if (companyPlanId !== undefined) updates.companyPlanId = companyPlanId || null;
        if (validFrom !== undefined) updates.validFrom = validFrom;
        if (validTo !== undefined) updates.validTo = validTo;
        if (amountAuthorized !== undefined) updates.amountAuthorized = amountAuthorized || null;
        if (reasonForCode !== undefined) updates.reasonForCode = reasonForCode || null;
        if (approvalNote !== undefined) updates.approvalNote = approvalNote || null;
        if (notes !== undefined) updates.notes = notes || null;
        if (status !== undefined) updates.status = status;

        await authCode.update(updates);

        await addAuditLog(req.models, {
            action: 'authorization_code.update',
            message: `Authorization code ${authCode.authorizationCode} updated`,
            userId: (req.user && req.user.id) ? req.user.id : null,
            userType: (req.user && req.user.type) ? req.user.type : null,
            meta: { authorizationCodeId: authCode.id }
        });

        return res.success({ authorizationCode: authCode }, 'Authorization code updated');
    } catch (err) {
        return next(err);
    }
}

async function deleteAuthorizationCode(req, res, next) {
    try {
        const { AuthorizationCode } = req.models;
        const { id } = req.params;

        const authCode = await AuthorizationCode.findByPk(id);
        if (!authCode) return res.fail('Authorization code not found', 404);

        const code = authCode.authorizationCode;

        await authCode.destroy();

        await addAuditLog(req.models, {
            action: 'authorization_code.delete',
            message: `Authorization code ${code} deleted`,
            userId: (req.user && req.user.id) ? req.user.id : null,
            userType: (req.user && req.user.type) ? req.user.type : null,
            meta: { authorizationCodeId: id }
        });

        return res.success(null, 'Authorization code deleted');
    } catch (err) {
        return next(err);
    }
}

async function listAuthorizationCodes(req, res, next) {
    try {
        const { AuthorizationCode, Enrollee, Provider, Diagnosis, Company, CompanyPlan, Admin } = req.models;
        const { limit = 10, page = 1, q, enrolleeId, providerId, authorizationType, status, companyId, isUsed } = req.query;

        const isAll = String(limit).toLowerCase() === 'all';
        const limitNum = isAll ? 0 : Number(limit);
        const pageNum = isAll ? 1 : (Number(page) || 1);
        const offset = isAll ? 0 : (pageNum - 1) * limitNum;

        const where = {};

        // Search by authorization code
        if (q) {
            where[Op.or] = [
                { authorizationCode: { [Op.iLike]: `%${q}%` } },
                { reasonForCode: { [Op.iLike]: `%${q}%` } },
                { notes: { [Op.iLike]: `%${q}%` } }
            ];
        }

        // Filter by enrollee
        if (enrolleeId) {
            where.enrolleeId = enrolleeId;
        }

        // Filter by provider
        if (providerId) {
            where.providerId = providerId;
        }

        // Filter by authorization type
        if (authorizationType) {
            where.authorizationType = authorizationType;
        }

        // Filter by status
        if (status) {
            where.status = status;
        }

        // Filter by company
        if (companyId) {
            where.companyId = companyId;
        }

        // Filter by usage status
        if (isUsed !== undefined) {
            where.isUsed = isUsed === 'true' || isUsed === true;
        }

        const total = await AuthorizationCode.count({ where });

        const findOptions = {
            where,
            order: [['createdAt', 'DESC']],
            include: [
                {
                    model: Enrollee,
                    attributes: ['id', 'firstName', 'lastName', 'policyNumber', 'email'],
                    required: false
                },
                {
                    model: Provider,
                    attributes: ['id', 'name', 'code', 'email'],
                    required: false
                },
                {
                    model: Diagnosis,
                    attributes: ['id', 'name',],
                    required: false
                },
                {
                    model: Company,
                    attributes: ['id', 'name'],
                    required: false
                },
                {
                    model: CompanyPlan,
                    attributes: ['id', 'name',],
                    required: false
                },
                {
                    model: Admin,
                    attributes: ['id', 'firstName', 'lastName', 'email'],
                    as: 'approver',
                    required: false
                }
            ]
        };

        if (!isAll) {
            findOptions.limit = limitNum;
            findOptions.offset = offset;
        }

        const authorizationCodes = await AuthorizationCode.findAll(findOptions);
        const data = authorizationCodes.map(a => a.toJSON());

        const hasPrevPage = !isAll && pageNum > 1;
        const hasNextPage = !isAll && (offset + authorizationCodes.length < total);
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

async function getAuthorizationCode(req, res, next) {
    try {
        const {
            AuthorizationCode,
            AuthorizationCodeRendered,
            Drug,
            Service,
            Provider,
            Diagnosis,
            Company,
            CompanyPlan,
            Admin
        } = req.models;
        const { id } = req.params;

        const authCode = await AuthorizationCode.findByPk(id, {
            include: [
                {
                    model: Provider,
                    attributes: ['id', 'name', 'code', 'email', 'phoneNumber'],
                    required: false
                },
                {
                    model: Diagnosis,
                    attributes: ['id', 'name', 'severity'],
                    required: false
                },
                {
                    model: Company,
                    attributes: ['id', 'name'],
                    required: false
                },
                {
                    model: CompanyPlan,
                    attributes: ['id', 'name', 'planId'],
                    required: false
                },
                {
                    model: Admin,
                    attributes: ['id', 'firstName', 'lastName', 'email'],
                    as: 'approver',
                    required: false
                },
                {
                    model: AuthorizationCodeRendered,
                    as: 'renderedItems',
                    required: false,
                    include: [
                        { model: Drug, attributes: ['id', 'name', 'unit', 'strength', 'price', 'currency'], required: false },
                        { model: Service, attributes: ['id', 'name', 'code', 'price', 'priceType', 'fixedPrice', 'rateType', 'rateAmount', 'currency'], required: false }
                    ]
                }
            ],
            order: [[{ model: AuthorizationCodeRendered, as: 'renderedItems' }, 'createdAt', 'ASC']]
        });

        if (!authCode) return res.fail('Authorization code not found', 404);

        const data = await attachMember(req.models, authCode.toJSON());
        return res.success({ authorizationCode: data }, 'Authorization code retrieved');
    } catch (err) {
        return next(err);
    }
}

async function reviewRenderedItem(req, res, next) {
    let transaction;

    try {
        const { AuthorizationCode, AuthorizationCodeRendered } = req.models;
        const { id, itemId } = req.params;
        const { action, approvedAmount, adminComment } = req.body || {};

        const validActions = ['approve', 'decline', 'partial'];
        if (!validActions.includes(action)) {
            return res.fail(`\`action\` must be one of: ${validActions.join(', ')}`, 400);
        }

        if (['decline', 'partial'].includes(action) && !adminComment) {
            return res.fail('`adminComment` is required for declined and partially approved items', 400);
        }

        const sequelize = AuthorizationCodeRendered.sequelize;
        transaction = await sequelize.transaction();

        const authCode = await AuthorizationCode.findByPk(id, { transaction });
        if (!authCode) {
            await transaction.rollback();
            transaction = null;
            return res.fail('Authorization code not found', 404);
        }

        const item = await AuthorizationCodeRendered.findOne({
            where: { id: itemId, authorizationCodeId: id },
            transaction,
            lock: transaction.LOCK.UPDATE
        });

        if (!item) {
            await transaction.rollback();
            transaction = null;
            return res.fail('Authorization code line item not found', 404);
        }

        const updates = {
            adminComment: adminComment || null,
            reviewedBy: req.user?.id || null,
            reviewedAt: new Date()
        };

        if (action === 'approve') {
            updates.status = 'approved';
            updates.approvedAmount = item.lineAmount;
        }

        if (action === 'decline') {
            updates.status = 'rejected';
            updates.approvedAmount = 0;
        }

        if (action === 'partial') {
            const amount = toMoney(approvedAmount);
            if (amount <= 0) {
                await transaction.rollback();
                transaction = null;
                return res.fail('`approvedAmount` must be greater than 0 for partial approval', 400);
            }

            if (amount >= toMoney(item.lineAmount)) {
                await transaction.rollback();
                transaction = null;
                return res.fail('`approvedAmount` must be less than the requested line amount for partial approval', 400);
            }

            updates.status = 'partial';
            updates.approvedAmount = amount;
        }

        await item.update(updates, { transaction });
        await syncAuthorizationCodeReviewState(req.models, id, transaction);
        await transaction.commit();
        transaction = null;

        await addAuditLog(req.models, {
            action: `authorization_code.line_item.${action}`,
            message: `Authorization code ${authCode.authorizationCode} line item reviewed`,
            userId: req.user?.id || null,
            userType: req.user?.type || null,
            meta: {
                authorizationCodeId: id,
                authorizationCodeRenderedId: itemId,
                action,
                approvedAmount: updates.approvedAmount
            }
        });

        const refreshed = await AuthorizationCode.findByPk(id, {
            include: [{ model: AuthorizationCodeRendered, as: 'renderedItems' }]
        });

        return res.success({ authorizationCode: refreshed }, 'Authorization code line item reviewed');
    } catch (err) {
        if (transaction) await transaction.rollback();
        return next(err);
    }
}

async function approveAuthorizationCode(req, res, next) {
    try {
        const { AuthorizationCode } = req.models;
        const { id } = req.params;
        const { approvalNote } = req.body || {};

        const authCode = await AuthorizationCode.findByPk(id);
        if (!authCode) return res.fail('Authorization code not found', 404);

        const approvalUpdate = {
            status: 'active',
            approvedBy: (req.user && req.user.id) ? req.user.id : null,
            dateTimeGiven: new Date(),
            approvalNote: approvalNote || null
        };

        await authCode.update(approvalUpdate);

        await addAuditLog(req.models, {
            action: 'authorization_code.approve',
            message: `Authorization code ${authCode.authorizationCode} approved`,
            userId: (req.user && req.user.id) ? req.user.id : null,
            userType: (req.user && req.user.type) ? req.user.type : null,
            meta: { authorizationCodeId: authCode.id }
        });

        return res.success({ authorizationCode: authCode }, 'Authorization code approved');
    } catch (err) {
        return next(err);
    }
}

async function rejectAuthorizationCode(req, res, next) {
    try {
        const { AuthorizationCode } = req.models;
        const { id } = req.params;
        const { approvalNote } = req.body || {};

        const authCode = await AuthorizationCode.findByPk(id);
        if (!authCode) return res.fail('Authorization code not found', 404);

        const rejectionUpdate = {
            status: 'cancelled',
            approvedBy: (req.user && req.user.id) ? req.user.id : null,
            approvalNote: approvalNote || null
        };

        await authCode.update(rejectionUpdate);

        await addAuditLog(req.models, {
            action: 'authorization_code.reject',
            message: `Authorization code ${authCode.authorizationCode} rejected`,
            userId: (req.user && req.user.id) ? req.user.id : null,
            userType: (req.user && req.user.type) ? req.user.type : null,
            meta: { authorizationCodeId: authCode.id }
        });

        return res.success({ authorizationCode: authCode }, 'Authorization code rejected');
    } catch (err) {
        return next(err);
    }
}

async function getAuthorizationTypeOptions(req, res, next) {
    try {
        const authorizationTypeOptions = ['inpatient', 'outpatient', 'procedure', 'medication', 'diagnostic'];
        return res.success({ authorizationTypeOptions });
    } catch (err) {
        return next(err);
    }
}

async function getAuthorizationStatusOptions(req, res, next) {
    try {
        const statusOptions = ['active', 'used', 'expired', 'cancelled', 'pending'];
        return res.success({ statusOptions });
    } catch (err) {
        return next(err);
    }
}

module.exports = {
    createAuthorizationCode,
    updateAuthorizationCode,
    deleteAuthorizationCode,
    listAuthorizationCodes,
    getAuthorizationCode,
    approveAuthorizationCode,
    rejectAuthorizationCode,
    reviewRenderedItem,
    getAuthorizationTypeOptions,
    getAuthorizationStatusOptions
};
