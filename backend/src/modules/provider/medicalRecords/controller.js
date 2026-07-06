'use strict';

const { Op } = require('sequelize');

const memberAttributes = ['id', 'firstName', 'lastName', 'policyNumber', 'email', 'phoneNumber'];
const historyAttributes = [
    'id',
    'providerId',
    'diagnosisId',
    'evsCode',
    'amount',
    'serviceDate',
    'notes',
    'attachmentUrl',
    'status',
    'currency',
    'createdAt',
    'updatedAt'
];

function normalizeRecord(history, member, memberType) {
    const data = typeof history.toJSON === 'function' ? history.toJSON() : history;
    const memberData = member && typeof member.toJSON === 'function' ? member.toJSON() : member;

    return {
        id: data.id,
        memberType,
        member: memberData || null,
        providerId: data.providerId,
        diagnosisId: data.diagnosisId,
        diagnosis: data.Diagnosis || data.diagnosis || null,
        provider: data.Provider || data.provider || null,
        evsCode: data.evsCode,
        amount: data.amount,
        serviceDate: data.serviceDate,
        notes: data.notes,
        attachmentUrl: data.attachmentUrl,
        status: data.status,
        currency: data.currency,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt
    };
}

function getMemberSearchWhere(query) {
    const trimmed = String(query || '').trim();
    if (!trimmed) return null;

    return {
        [Op.or]: [
            { email: { [Op.iLike || Op.like]: trimmed } },
            { policyNumber: { [Op.iLike || Op.like]: trimmed } }
        ]
    };
}

async function findMembers(models, query) {
    const {
        Enrollee,
        EnrolleeDependent,
        RetailEnrollee,
        RetailEnrolleeDependent
    } = models;
    const where = getMemberSearchWhere(query);
    if (!where) return [];

    const [enrollees, dependents, retailEnrollees, retailDependents] = await Promise.all([
        Enrollee.findAll({ where, attributes: memberAttributes }),
        EnrolleeDependent.findAll({ where, attributes: [...memberAttributes, 'enrolleeId'] }),
        RetailEnrollee.findAll({ where, attributes: memberAttributes }),
        RetailEnrolleeDependent.findAll({ where, attributes: [...memberAttributes, 'retailEnrolleeId'] })
    ]);

    return [
        ...enrollees.map((member) => ({ type: 'enrollee', member })),
        ...dependents.map((member) => ({ type: 'dependent', member })),
        ...retailEnrollees.map((member) => ({ type: 'retail_enrollee', member })),
        ...retailDependents.map((member) => ({ type: 'retail_dependent', member }))
    ];
}

function buildInclude(models) {
    return [
        { model: models.Provider, attributes: ['id', 'name', 'code', 'email'], required: false },
        { model: models.Diagnosis, attributes: ['id', 'name', 'severity'], required: false }
    ];
}

function isMissingRelationError(error) {
    return error?.original?.code === '42P01' || /relation .* does not exist/i.test(error?.message || '');
}

async function findAllOrEmptyOnMissingRelation(model, options) {
    try {
        return await model.findAll(options);
    } catch (error) {
        if (isMissingRelationError(error)) return [];
        throw error;
    }
}

async function findOneOrNullOnMissingRelation(model, options) {
    try {
        return await model.findOne(options);
    } catch (error) {
        if (isMissingRelationError(error)) return null;
        throw error;
    }
}

async function fetchHistoryForMember(models, providerId, typedMember) {
    const include = buildInclude(models);
    const commonOptions = {
        where: { providerId },
        attributes: historyAttributes,
        include,
        order: [['serviceDate', 'DESC'], ['createdAt', 'DESC']]
    };

    if (typedMember.type === 'enrollee') {
        const rows = await models.EnrolleeMedicalHistory.findAll({
            ...commonOptions,
            where: { ...commonOptions.where, enrolleeId: typedMember.member.id }
        });
        return rows.map((row) => normalizeRecord(row, typedMember.member, typedMember.type));
    }

    if (typedMember.type === 'dependent') {
        const rows = await models.EnrolleeDependentMedicalHistory.findAll({
            ...commonOptions,
            where: { ...commonOptions.where, enrolleeDependentId: typedMember.member.id }
        });
        return rows.map((row) => normalizeRecord(row, typedMember.member, typedMember.type));
    }

    if (typedMember.type === 'retail_enrollee') {
        const rows = await models.RetailEnrolleeMedicalHistory.findAll({
            ...commonOptions,
            where: { ...commonOptions.where, retailEnrolleeId: typedMember.member.id }
        });
        return rows.map((row) => normalizeRecord(row, typedMember.member, typedMember.type));
    }

    const rows = await findAllOrEmptyOnMissingRelation(models.RetailEnrolleeDependentMedicalHistory, {
        ...commonOptions,
        where: { ...commonOptions.where, retailEnrolleeDependentId: typedMember.member.id }
    });
    return rows.map((row) => normalizeRecord(row, typedMember.member, typedMember.type));
}

async function fetchProviderHistories(models, providerId) {
    const include = buildInclude(models);
    const options = {
        where: { providerId },
        attributes: historyAttributes,
        include,
        order: [['serviceDate', 'DESC'], ['createdAt', 'DESC']],
        limit: 200
    };

    const [enrolleeRows, dependentRows, retailRows, retailDependentRows] = await Promise.all([
        models.EnrolleeMedicalHistory.findAll({
            ...options,
            include: [
                ...include,
                { model: models.Enrollee, attributes: memberAttributes, required: false }
            ]
        }),
        models.EnrolleeDependentMedicalHistory.findAll({
            ...options,
            include: [
                ...include,
                { model: models.EnrolleeDependent, attributes: [...memberAttributes, 'enrolleeId'], required: false }
            ]
        }),
        models.RetailEnrolleeMedicalHistory.findAll({
            ...options,
            include: [
                ...include,
                { model: models.RetailEnrollee, attributes: memberAttributes, required: false }
            ]
        }),
        findAllOrEmptyOnMissingRelation(models.RetailEnrolleeDependentMedicalHistory, {
            ...options,
            include: [
                ...include,
                { model: models.RetailEnrolleeDependent, attributes: [...memberAttributes, 'retailEnrolleeId'], required: false }
            ]
        })
    ]);

    return [
        ...enrolleeRows.map((row) => normalizeRecord(row, row.Enrollee, 'enrollee')),
        ...dependentRows.map((row) => normalizeRecord(row, row.EnrolleeDependent, 'dependent')),
        ...retailRows.map((row) => normalizeRecord(row, row.RetailEnrollee, 'retail_enrollee')),
        ...retailDependentRows.map((row) => normalizeRecord(row, row.RetailEnrolleeDependent, 'retail_dependent'))
    ].sort((a, b) => new Date(b.serviceDate || b.createdAt) - new Date(a.serviceDate || a.createdAt));
}

async function listMedicalRecords(req, res, next) {
    try {
        const providerId = req.user?.id;
        const query = String(req.query.query || req.query.q || '').trim();

        if (!providerId) return res.fail('Provider ID is required', 400);

        let members = [];
        let records = [];

        if (query) {
            members = await findMembers(req.models, query);
            const groupedRecords = await Promise.all(
                members.map((member) => fetchHistoryForMember(req.models, providerId, member))
            );
            records = groupedRecords.flat();
        } else {
            records = await fetchProviderHistories(req.models, providerId);
        }

        records.sort((a, b) => new Date(b.serviceDate || b.createdAt) - new Date(a.serviceDate || a.createdAt));

        return res.success(
            {
                records,
                count: records.length,
                members: members.map(({ type, member }) => ({ type, member }))
            },
            'Medical records retrieved'
        );
    } catch (err) {
        return next(err);
    }
}

async function getMedicalRecord(req, res, next) {
    try {
        const providerId = req.user?.id;
        const { id } = req.params;
        const type = String(req.query.type || '');

        if (!providerId) return res.fail('Provider ID is required', 400);
        if (!type) return res.fail('Record type is required', 400);

        const include = buildInclude(req.models);
        const options = {
            where: { id, providerId },
            attributes: historyAttributes,
            include
        };

        let row = null;
        let member = null;

        if (type === 'enrollee') {
            row = await req.models.EnrolleeMedicalHistory.findOne({
                ...options,
                include: [...include, { model: req.models.Enrollee, attributes: memberAttributes, required: false }]
            });
            member = row?.Enrollee;
        } else if (type === 'dependent') {
            row = await req.models.EnrolleeDependentMedicalHistory.findOne({
                ...options,
                include: [...include, { model: req.models.EnrolleeDependent, attributes: [...memberAttributes, 'enrolleeId'], required: false }]
            });
            member = row?.EnrolleeDependent;
        } else if (type === 'retail_enrollee') {
            row = await req.models.RetailEnrolleeMedicalHistory.findOne({
                ...options,
                include: [...include, { model: req.models.RetailEnrollee, attributes: memberAttributes, required: false }]
            });
            member = row?.RetailEnrollee;
        } else if (type === 'retail_dependent') {
            row = await findOneOrNullOnMissingRelation(req.models.RetailEnrolleeDependentMedicalHistory, {
                ...options,
                include: [...include, { model: req.models.RetailEnrolleeDependent, attributes: [...memberAttributes, 'retailEnrolleeId'], required: false }]
            });
            member = row?.RetailEnrolleeDependent;
        } else {
            return res.fail('Unsupported record type', 400);
        }

        if (!row) return res.fail('Medical record not found', 404);

        return res.success({ record: normalizeRecord(row, member, type) }, 'Medical record retrieved');
    } catch (err) {
        return next(err);
    }
}

module.exports = {
    listMedicalRecords,
    getMedicalRecord
};
