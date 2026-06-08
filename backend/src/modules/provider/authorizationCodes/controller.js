'use strict';

const authorizationCodeGenerator = require('../../../utils/authorizationCodeGenerator');
const { addAuditLog } = require('../../../utils/addAdminNotification');

const DAY_MS = 24 * 60 * 60 * 1000;

function toMoney(value) {
    const amount = Number(value || 0);
    return Number.isFinite(amount) ? amount : 0;
}

function normalizeMemberPayload(body) {
    const resultType = body.resultType || body.memberType || 'enrollee';
    const id = body.memberId || body.enrolleeId || body.dependentId || body.retailEnrolleeId || body.retailEnrolleeDependentId;

    if (resultType === 'dependent') return { enrolleeDependentId: body.dependentId || body.enrolleeDependentId || id };
    if (resultType === 'retail_enrollee') return { retailEnrolleeId: body.retailEnrolleeId || id };
    if (resultType === 'retail_dependent') return { retailEnrolleeDependentId: body.retailEnrolleeDependentId || body.dependentId || id };
    return { enrolleeId: body.enrolleeId || id };
}

async function resolveMember(models, memberFields) {
    const { Enrollee, EnrolleeDependent, RetailEnrollee, RetailEnrolleeDependent } = models;

    if (memberFields.enrolleeId) {
        const enrollee = await Enrollee.findByPk(memberFields.enrolleeId);
        if (!enrollee) return null;
        return {
            fields: { enrolleeId: enrollee.id, companyId: enrollee.companyId || null, companyPlanId: enrollee.companyPlanId || null },
            label: `enrollee ${enrollee.id}`
        };
    }

    if (memberFields.enrolleeDependentId) {
        const dependent = await EnrolleeDependent.findByPk(memberFields.enrolleeDependentId, { include: [{ model: Enrollee }] });
        if (!dependent) return null;
        const primary = dependent.Enrollee || {};
        return {
            fields: {
                enrolleeDependentId: dependent.id,
                companyId: primary.companyId || null,
                companyPlanId: primary.companyPlanId || null
            },
            label: `dependent ${dependent.id}`
        };
    }

    if (memberFields.retailEnrolleeId) {
        const retailEnrollee = await RetailEnrollee.findByPk(memberFields.retailEnrolleeId);
        if (!retailEnrollee) return null;
        return {
            fields: { retailEnrolleeId: retailEnrollee.id },
            label: `retail enrollee ${retailEnrollee.id}`
        };
    }

    if (memberFields.retailEnrolleeDependentId) {
        const retailDependent = await RetailEnrolleeDependent.findByPk(memberFields.retailEnrolleeDependentId);
        if (!retailDependent) return null;
        return {
            fields: { retailEnrolleeDependentId: retailDependent.id },
            label: `retail dependent ${retailDependent.id}`
        };
    }

    return null;
}

async function resolveRenderedItems(models, providerId, items) {
    const { Drug, Service } = models;
    const renderedItems = [];
    let totalAmount = 0;

    for (const item of items) {
        const itemType = item.itemType;
        const itemId = item.itemId;
        const quantity = toMoney(item.quantity || item.quantityRendered);

        if (!['drug', 'service'].includes(itemType)) {
            throw new Error('Each item type must be drug or service');
        }
        if (!itemId) throw new Error('Each item must include an itemId');
        if (quantity <= 0) throw new Error('Each item quantity must be greater than 0');

        if (itemType === 'drug') {
            const drug = await Drug.findOne({ where: { id: itemId, providerId, isDeleted: false } });
            if (!drug) throw new Error('Selected drug was not found for this provider');

            const unitPrice = toMoney(drug.price);
            const lineAmount = unitPrice * quantity;
            totalAmount += lineAmount;
            renderedItems.push({
                drugId: drug.id,
                serviceId: null,
                itemName: drug.name,
                unit: drug.unit,
                unitPrice,
                quantityRendered: quantity,
                lineAmount,
                status: 'pending',
                notes: item.notes || null
            });
            continue;
        }

        const service = await Service.findOne({ where: { id: itemId, providerId, isDeleted: false } });
        if (!service) throw new Error('Selected service was not found for this provider');

        const unitPrice = toMoney(service.price || service.fixedPrice || service.rateAmount);
        const lineAmount = unitPrice * quantity;
        totalAmount += lineAmount;
        renderedItems.push({
            drugId: null,
            serviceId: service.id,
            itemName: service.name,
            unit: service.rateType || service.priceType || 'service',
            unitPrice,
            quantityRendered: quantity,
            lineAmount,
            status: 'pending',
            notes: item.notes || null
        });
    }

    return { renderedItems, totalAmount };
}

async function createAuthorizationCode(req, res, next) {
    try {
        const {
            AuthorizationCode,
            AuthorizationCodeRendered,
            Provider,
            Diagnosis
        } = req.models;
        const providerId = req.user?.id;
        const {
            diagnosisId,
            authorizationType,
            date,
            validFrom,
            validTo,
            notes,
            reasonForCode,
            items = []
        } = req.body || {};

        if (!providerId) return res.fail('Provider ID is required', 400);
        if (!authorizationType) return res.fail('`authorizationType` is required', 400);
        if (!date && !validFrom) return res.fail('`date` is required', 400);
        if (!Array.isArray(items) || items.length === 0) return res.fail('At least one service encounter item is required', 400);

        const provider = await Provider.findByPk(providerId);
        if (!provider) return res.fail('Provider not found', 404);

        if (diagnosisId) {
            const diagnosis = await Diagnosis.findByPk(diagnosisId);
            if (!diagnosis) return res.fail('Diagnosis not found', 404);
        }

        const memberFields = normalizeMemberPayload(req.body || {});
        const resolvedMember = await resolveMember(req.models, memberFields);
        if (!resolvedMember) return res.fail('Enrollee not found', 404);

        const startDate = new Date(date || validFrom);
        const endDate = validTo ? new Date(validTo) : new Date(startDate.getTime() + DAY_MS);
        if (Number.isNaN(startDate.getTime())) return res.fail('Invalid authorization date', 400);
        if (startDate >= endDate) return res.fail('`validTo` must be after authorization date', 400);

        const validAuthorizationTypes = ['inpatient', 'outpatient', 'procedure', 'medication', 'diagnostic'];
        if (!validAuthorizationTypes.includes(authorizationType)) {
            return res.fail(`\`authorizationType\` must be one of: ${validAuthorizationTypes.join(', ')}`, 400);
        }

        let pricedItems;
        try {
            pricedItems = await resolveRenderedItems(req.models, providerId, items);
        } catch (error) {
            return res.fail(error.message, 400);
        }

        const authorizationCode = await AuthorizationCode.sequelize.transaction(async (transaction) => {
            const authCode = await authorizationCodeGenerator.getUniqueAuthorizationCode(AuthorizationCode);
            const created = await AuthorizationCode.create({
                authorizationCode: authCode,
                ...resolvedMember.fields,
                providerId,
                diagnosisId: diagnosisId || null,
                authorizationType,
                validFrom: startDate,
                validTo: endDate,
                amountAuthorized: pricedItems.totalAmount,
                reasonForCode: reasonForCode || null,
                notes: notes || null,
                status: 'pending'
            }, { transaction });

            await AuthorizationCodeRendered.bulkCreate(
                pricedItems.renderedItems.map((item) => ({
                    ...item,
                    authorizationCodeId: created.id
                })),
                { transaction }
            );

            return created;
        });

        const createdWithItems = await AuthorizationCode.findByPk(authorizationCode.id, {
            include: [{ model: AuthorizationCodeRendered, as: 'renderedItems' }]
        });

        await addAuditLog(req.models, {
            action: 'provider_authorization_code.create',
            message: `Provider ${providerId} requested authorization code ${authorizationCode.authorizationCode} for ${resolvedMember.label}`,
            userId: providerId,
            userType: req.user?.type || 'provider',
            meta: {
                authorizationCodeId: authorizationCode.id,
                providerId,
                amountAuthorized: pricedItems.totalAmount,
                itemCount: pricedItems.renderedItems.length
            }
        });

        return res.success(
            { authorizationCode: createdWithItems.toJSON() },
            'Authorization code request created',
            201
        );
    } catch (err) {
        return next(err);
    }
}

module.exports = {
    createAuthorizationCode
};
