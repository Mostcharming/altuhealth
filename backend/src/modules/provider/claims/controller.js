'use strict';

const { Op } = require('sequelize');
const { addAuditLog } = require('../../../utils/addAdminNotification');
const { createAdminApproval } = require('../../../utils/adminApproval');

function toMoney(value) {
    const amount = Number(value || 0);
    return Number.isFinite(amount) ? amount : 0;
}

function toPositiveInt(value, fallback = 1) {
    const parsed = Number.parseInt(value, 10);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function generateClaimReference() {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `CLM-${timestamp}-${random}`;
}

function memberName(member) {
    if (!member) return null;
    return [member.firstName, member.lastName].filter(Boolean).join(' ').trim() || null;
}

function attachMember(data, member, memberType) {
    data.member = member ? member.toJSON() : null;
    data.memberType = memberType;
    data.memberName = memberName(data.member);
    data.policyNumber = data.member?.policyNumber || null;
}

async function hydrateAuthorizationMembers(models, rows) {
    const { Enrollee, EnrolleeDependent, RetailEnrollee, RetailEnrolleeDependent } = models;

    return Promise.all(rows.map(async (row) => {
        const data = row.toJSON ? row.toJSON() : row;
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

        attachMember(data, member, memberType);
        return data;
    }));
}

function buildClaimInclude(models) {
    const {
        Provider,
        PaymentBatch,
        ClaimDetail,
        ClaimDetailItem,
        Enrollee,
        RetailEnrollee,
        Diagnosis,
        Company
    } = models;

    return [
        {
            model: Provider,
            attributes: ['id', 'name', 'code', 'email', 'phoneNumber', 'category', 'address']
        },
        {
            model: PaymentBatch,
            attributes: ['id', 'title', 'status', 'paymentDate', 'dueDate'],
            required: false
        },
        {
            model: ClaimDetail,
            as: 'claimDetails',
            include: [
                {
                    model: Enrollee,
                    attributes: ['id', 'firstName', 'lastName', 'email', 'phoneNumber', 'policyNumber'],
                    required: false
                },
                {
                    model: RetailEnrollee,
                    attributes: ['id', 'firstName', 'lastName', 'email', 'phoneNumber', 'policyNumber'],
                    required: false
                },
                {
                    model: Provider,
                    attributes: ['id', 'name', 'code', 'email', 'category'],
                    required: false
                },
                {
                    model: Diagnosis,
                    attributes: ['id', 'name', 'description'],
                    required: false
                },
                {
                    model: Company,
                    attributes: ['id', 'name'],
                    required: false
                },
                {
                    model: ClaimDetailItem,
                    as: 'items',
                    attributes: ['id', 'itemType', 'itemName', 'quantity', 'unitPrice', 'totalAmount', 'unit', 'description'],
                    required: false
                }
            ],
            required: false
        }
    ];
}

async function searchApprovedAuthorizationCodes(req, res, next) {
    try {
        const {
            AuthorizationCode,
            AuthorizationCodeRendered,
            Drug,
            Service,
            Diagnosis,
            Company,
            CompanyPlan
        } = req.models;
        const providerId = req.user?.id;
        const { q = '', limit = 20 } = req.query;

        if (!providerId) return res.fail('Provider ID is required', 400);

        const where = {
            providerId,
            status: 'active',
            dateTimeGiven: { [Op.ne]: null }
        };

        if (q) {
            where.authorizationCode = { [Op.iLike]: `%${q}%` };
        }

        const rows = await AuthorizationCode.findAll({
            where,
            include: [
                { model: Diagnosis, attributes: ['id', 'name'], required: false },
                { model: Company, attributes: ['id', 'name'], required: false },
                { model: CompanyPlan, attributes: ['id', 'name', 'planId'], required: false },
                {
                    model: AuthorizationCodeRendered,
                    as: 'renderedItems',
                    required: false,
                    include: [
                        { model: Drug, attributes: ['id', 'name', 'unit', 'price'], required: false },
                        { model: Service, attributes: ['id', 'name', 'code', 'price', 'fixedPrice', 'rateAmount'], required: false }
                    ]
                }
            ],
            limit: Math.min(toPositiveInt(limit, 20), 50),
            order: [['dateTimeGiven', 'DESC'], ['createdAt', 'DESC']]
        });

        const authorizationCodes = await hydrateAuthorizationMembers(req.models, rows);
        return res.success({ authorizationCodes }, 'Approved authorization codes retrieved');
    } catch (err) {
        return next(err);
    }
}

async function createClaimFromAuthorization(req, res, next) {
    const { sequelize, AuthorizationCode, AuthorizationCodeRendered, Claim, ClaimDetail, ClaimDetailItem, Provider } = req.models;
    const transaction = await sequelize.transaction();

    try {
        const providerId = req.user?.id;
        const { authorizationCodeId, authorizationCode, notes, saveAsDraft = false } = req.body || {};

        if (!providerId) {
            await transaction.rollback();
            return res.fail('Provider ID is required', 400);
        }

        if (!authorizationCodeId && !authorizationCode) {
            await transaction.rollback();
            return res.fail('`authorizationCodeId` or `authorizationCode` is required', 400);
        }

        const provider = await Provider.findByPk(providerId, { transaction });
        if (!provider) {
            await transaction.rollback();
            return res.fail('Provider not found', 404);
        }

        const auth = await AuthorizationCode.findOne({
            where: {
                providerId,
                status: 'active',
                dateTimeGiven: { [Op.ne]: null },
                ...(authorizationCodeId ? { id: authorizationCodeId } : { authorizationCode })
            },
            include: [{ model: AuthorizationCodeRendered, as: 'renderedItems', required: false }],
            transaction,
            lock: transaction.LOCK.UPDATE
        });

        if (!auth) {
            await transaction.rollback();
            return res.fail('Approved authorization code not found for this provider', 404);
        }

        const renderedItems = auth.renderedItems || [];
        if (!renderedItems.length) {
            await transaction.rollback();
            return res.fail('Authorization code has no line items to bill', 400);
        }

        const approvedItems = renderedItems.filter((item) => item.status === 'approved');
        if (!approvedItems.length) {
            await transaction.rollback();
            return res.fail('Authorization code has no approved line items to bill', 400);
        }
        if (approvedItems.some((item) => !item.drugId && !item.serviceId)) {
            await transaction.rollback();
            return res.fail('Authorization code has approved line items without a linked drug or service', 400);
        }

        const serviceDate = auth.validFrom || auth.dateTimeGiven || new Date();
        const date = new Date(serviceDate);
        const amountSubmitted = approvedItems.reduce((sum, item) => {
            const quantity = toMoney(item.quantityRendered) || 1;
            const unitPrice = toMoney(item.unitPrice);
            return sum + (toMoney(item.lineAmount) || quantity * unitPrice);
        }, 0);

        const claimReference = generateClaimReference();
        const status = saveAsDraft ? 'draft' : 'submitted';

        const claim = await Claim.create({
            providerId,
            numberOfEncounters: 1,
            amountSubmitted,
            amountProcessed: 0,
            difference: 0,
            year: date.getFullYear(),
            month: date.getMonth() + 1,
            dateSubmitted: new Date(),
            submittedByType: 'Provider',
            submittedById: providerId,
            status,
            claimReference,
            description: notes || auth.notes || auth.reasonForCode || null
        }, { transaction });

        const claimDetail = await ClaimDetail.create({
            claimId: claim.id,
            enrolleeId: auth.enrolleeId || null,
            retailEnrolleeId: auth.retailEnrolleeId || null,
            companyId: auth.companyId || null,
            providerId,
            diagnosisId: auth.diagnosisId || null,
            serviceDate,
            serviceType: auth.authorizationType,
            description: notes || auth.reasonForCode || auth.notes || null,
            amountSubmitted,
            amountApproved: 0,
            amountRejected: 0,
            authorizationCode: auth.authorizationCode,
            status
        }, { transaction });

        const claimItems = approvedItems.map((item) => {
            const quantity = toMoney(item.quantityRendered) || 1;
            const unitPrice = toMoney(item.unitPrice);
            return {
                claimDetailId: claimDetail.id,
                itemType: item.drugId ? 'drug' : 'service',
                itemId: item.drugId || item.serviceId,
                itemName: item.itemName || 'Authorized item',
                quantity: toPositiveInt(quantity, 1),
                unitPrice,
                totalAmount: toMoney(item.lineAmount) || quantity * unitPrice,
                unit: item.unit || null,
                description: item.notes || null
            };
        });

        await ClaimDetailItem.bulkCreate(claimItems, { transaction });

        if (!saveAsDraft) {
            try {
                await createAdminApproval(req.models, {
                    model: 'Claim',
                    modelId: claim.id,
                    action: 'submit',
                    details: {
                        claimReference,
                        providerId,
                        providerName: provider.name,
                        amountSubmitted,
                        numberOfEncounters: 1,
                        authorizationCode: auth.authorizationCode,
                        period: `${date.getMonth() + 1}/${date.getFullYear()}`
                    },
                    requestedBy: providerId,
                    requestedByType: 'Provider',
                    comments: `Provider submitted bill ${claimReference} for authorization ${auth.authorizationCode}`
                });
            } catch (approvalErr) {
                console.warn('Failed to create approval for provider claim:', approvalErr.message);
            }
        }

        await addAuditLog(req.models, {
            action: saveAsDraft ? 'provider_claim.save_draft' : 'provider_claim.submit',
            message: `Provider ${providerId} ${saveAsDraft ? 'saved draft bill' : 'submitted bill'} ${claimReference} from authorization ${auth.authorizationCode}`,
            userId: providerId,
            userType: req.user?.type || 'Provider',
            meta: { claimId: claim.id, authorizationCodeId: auth.id, providerId, amountSubmitted }
        });

        await transaction.commit();

        const created = await Claim.findByPk(claim.id, { include: buildClaimInclude(req.models) });
        return res.success({ claim: created }, saveAsDraft ? 'Bill saved as draft' : 'Bill submitted successfully', 201);
    } catch (err) {
        await transaction.rollback();
        return next(err);
    }
}

async function listClaims(req, res, next) {
    try {
        const { Claim, Provider } = req.models;
        const providerId = req.user?.id;
        const { page = 1, limit = 20, status, search, year, month } = req.query;

        if (!providerId) return res.fail('Provider ID is required', 400);

        const where = { providerId };
        if (status) {
            const statuses = String(status).split(',').map((item) => item.trim()).filter(Boolean);
            where.status = statuses.length > 1 ? { [Op.in]: statuses } : statuses[0];
        }
        if (year) where.year = Number.parseInt(year, 10);
        if (month) where.month = Number.parseInt(month, 10);
        if (search) {
            where[Op.or] = [
                { claimReference: { [Op.iLike]: `%${search}%` } },
                { description: { [Op.iLike]: `%${search}%` } }
            ];
        }

        const safeLimit = Math.min(toPositiveInt(limit, 20), 100);
        const safePage = toPositiveInt(page, 1);
        const offset = (safePage - 1) * safeLimit;

        const { count, rows } = await Claim.findAndCountAll({
            where,
            include: [{ model: Provider, attributes: ['id', 'name', 'code', 'email', 'phoneNumber'] }],
            limit: safeLimit,
            offset,
            order: [['createdAt', 'DESC']]
        });

        return res.success({
            claims: rows,
            pagination: {
                total: count,
                page: safePage,
                limit: safeLimit,
                pages: Math.ceil(count / safeLimit),
                hasNextPage: safePage * safeLimit < count,
                hasPreviousPage: safePage > 1
            }
        }, 'Provider claims retrieved successfully');
    } catch (err) {
        return next(err);
    }
}

async function getClaimById(req, res, next) {
    try {
        const { Claim } = req.models;
        const providerId = req.user?.id;
        const { id } = req.params;

        if (!providerId) return res.fail('Provider ID is required', 400);

        const claim = await Claim.findOne({
            where: { id, providerId },
            include: buildClaimInclude(req.models)
        });

        if (!claim) return res.fail('Claim not found', 404);

        return res.success(claim, 'Claim retrieved successfully');
    } catch (err) {
        return next(err);
    }
}

async function submitClaim(req, res, next) {
    try {
        const { Claim, Provider } = req.models;
        const providerId = req.user?.id;
        const { id } = req.params;
        const { notes } = req.body || {};

        if (!providerId) return res.fail('Provider ID is required', 400);

        const claim = await Claim.findOne({ where: { id, providerId }, include: [Provider] });
        if (!claim) return res.fail('Claim not found', 404);
        if (claim.status !== 'draft') return res.fail('Only draft bills can be submitted', 400);

        await claim.update({
            status: 'submitted',
            vetterNotes: notes || claim.vetterNotes || null
        });

        try {
            await createAdminApproval(req.models, {
                model: 'Claim',
                modelId: claim.id,
                action: 'submit',
                details: {
                    claimReference: claim.claimReference,
                    providerId: claim.providerId,
                    providerName: claim.Provider?.name,
                    amountSubmitted: claim.amountSubmitted,
                    numberOfEncounters: claim.numberOfEncounters,
                    period: `${claim.month}/${claim.year}`
                },
                requestedBy: providerId,
                requestedByType: 'Provider',
                comments: `Provider submitted bill ${claim.claimReference} for review`
            });
        } catch (approvalErr) {
            console.warn('Failed to create approval for provider claim submission:', approvalErr.message);
        }

        await addAuditLog(req.models, {
            action: 'provider_claim.submit_draft',
            message: `Provider ${providerId} submitted draft bill ${claim.claimReference}`,
            userId: providerId,
            userType: req.user?.type || 'Provider',
            meta: { claimId: claim.id, providerId }
        });

        return res.success(claim, 'Bill submitted successfully');
    } catch (err) {
        return next(err);
    }
}

module.exports = {
    searchApprovedAuthorizationCodes,
    createClaimFromAuthorization,
    listClaims,
    getClaimById,
    submitClaim
};
