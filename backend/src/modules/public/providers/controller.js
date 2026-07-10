'use strict';

const { Op } = require('sequelize');

const CATEGORY_LABELS = {
    primary: 'Primary Care',
    secondary: 'Secondary Care',
    tertiary: 'Tertiary Care',
    specialized: 'Specialist Care'
};

function normalizeText(value) {
    return String(value || '').trim();
}

function toNumber(value) {
    if (value === null || value === undefined || value === '') return null;
    const numberValue = Number(value);
    return Number.isFinite(numberValue) ? numberValue : null;
}

function serializeProvider(provider) {
    const plain = provider.toJSON();
    const specialization = plain.ProviderSpecialization || null;
    const categoryLabel = CATEGORY_LABELS[plain.category] || 'Healthcare Provider';

    return {
        id: plain.id,
        name: plain.name,
        category: plain.category,
        categoryLabel,
        type: specialization?.name || categoryLabel,
        specialization: specialization
            ? {
                id: specialization.id,
                name: specialization.name,
                description: specialization.description
            }
            : null,
        phoneNumber: plain.phoneNumber,
        secondaryPhoneNumber: plain.secondaryPhoneNumber,
        website: plain.website,
        country: plain.country,
        state: plain.state,
        lga: plain.lga,
        address: plain.address,
        providerArea: plain.providerArea,
        currentLocation: plain.currentLocation,
        latitude: toNumber(plain.latitude),
        longitude: toNumber(plain.longitude),
        picture: plain.picture
    };
}

function uniqueSorted(values) {
    return Array.from(new Set(values.map(normalizeText).filter(Boolean)))
        .sort((a, b) => a.localeCompare(b));
}

async function listPublicProviders(req, res, next) {
    try {
        const { Provider, ProviderSpecialization } = req.models;
        const { q, country, state, lga, category } = req.query;
        const where = {
            status: 'active',
            isDeleted: false
        };

        if (country) where.country = country;
        if (state) where.state = state;
        if (lga) where.lga = lga;
        if (category) where.category = category;

        const query = normalizeText(q);
        if (query) {
            const search = `%${query}%`;
            where[Op.or] = [
                { name: { [Op.iLike]: search } },
                { address: { [Op.iLike]: search } },
                { state: { [Op.iLike]: search } },
                { lga: { [Op.iLike]: search } },
                { providerArea: { [Op.iLike]: search } }
            ];
        }

        const providers = await Provider.findAll({
            attributes: [
                'id',
                'name',
                'category',
                'phoneNumber',
                'secondaryPhoneNumber',
                'website',
                'country',
                'state',
                'lga',
                'address',
                'providerArea',
                'currentLocation',
                'latitude',
                'longitude',
                'picture'
            ],
            where,
            include: [
                {
                    model: ProviderSpecialization,
                    attributes: ['id', 'name', 'description'],
                    required: false
                }
            ],
            order: [
                ['state', 'ASC'],
                ['lga', 'ASC'],
                ['name', 'ASC']
            ]
        });

        const list = providers.map(serializeProvider);
        const states = uniqueSorted(list.map(provider => provider.state));
        const lgas = uniqueSorted(list.map(provider => provider.lga));
        const lgasByState = states.reduce((acc, providerState) => {
            acc[providerState] = uniqueSorted(
                list
                    .filter(provider => normalizeText(provider.state) === providerState)
                    .map(provider => provider.lga)
            );
            return acc;
        }, {});

        return res.success({
            list,
            count: list.length,
            states,
            lgasByState,
            summary: {
                providerCount: list.length,
                stateCount: states.length,
                lgaCount: lgas.length
            }
        }, 'Providers fetched');
    } catch (err) {
        return next(err);
    }
}

module.exports = {
    listPublicProviders
};
