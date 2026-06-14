'use strict';

const publicPlans = [
    {
        id: '60000000-0000-0000-0000-000000000001',
        code: 'SENIOR_BASIC_SINGLE_PARENT',
        name: 'Senior Basic',
        description: 'International senior basic plan for single parent coverage.',
        annual_premium_price: 25,
        currency: 'GBP',
        plan_cycle: 'monthly',
        allow_dependent_enrolee: false
    },
    {
        id: '60000000-0000-0000-0000-000000000002',
        code: 'SENIOR_BASIC_COUPLE',
        name: 'Senior Basic',
        description: 'International senior basic plan for couple coverage.',
        annual_premium_price: 48,
        currency: 'GBP',
        plan_cycle: 'monthly',
        allow_dependent_enrolee: true
    },
    {
        id: '60000000-0000-0000-0000-000000000003',
        code: 'SENIOR_STANDARD_SINGLE_PARENT',
        name: 'Senior Standard',
        description: 'International senior standard plan for single parent coverage.',
        annual_premium_price: 35,
        currency: 'GBP',
        plan_cycle: 'monthly',
        allow_dependent_enrolee: false
    },
    {
        id: '60000000-0000-0000-0000-000000000004',
        code: 'SENIOR_STANDARD_COUPLE',
        name: 'Senior Standard',
        description: 'International senior standard plan for couple coverage.',
        annual_premium_price: 68,
        currency: 'GBP',
        plan_cycle: 'monthly',
        allow_dependent_enrolee: true
    },
    {
        id: '60000000-0000-0000-0000-000000000005',
        code: 'SENIOR_ELITE_SINGLE_PARENT',
        name: 'Senior Elite',
        description: 'International senior elite plan for single parent coverage.',
        annual_premium_price: 55,
        currency: 'GBP',
        plan_cycle: 'monthly',
        allow_dependent_enrolee: false
    },
    {
        id: '60000000-0000-0000-0000-000000000006',
        code: 'SENIOR_ELITE_COUPLE',
        name: 'Senior Elite',
        description: 'International senior elite plan for couple coverage.',
        annual_premium_price: 105,
        currency: 'GBP',
        plan_cycle: 'monthly',
        allow_dependent_enrolee: true
    },
    {
        id: '60000000-0000-0000-0000-000000000007',
        code: 'VITAL_BASIC_INDIVIDUAL',
        name: 'Vital Basic',
        description: 'Nigerian vital basic plan for individual coverage.',
        annual_premium_price: 100000,
        currency: 'NGN',
        plan_cycle: 'annual',
        allow_dependent_enrolee: false
    },
    {
        id: '60000000-0000-0000-0000-000000000008',
        code: 'VITAL_BASIC_FAMILY',
        name: 'Vital Basic',
        description: 'Nigerian vital basic plan for family coverage.',
        annual_premium_price: 500000,
        currency: 'NGN',
        plan_cycle: 'annual',
        allow_dependent_enrolee: true
    },
    {
        id: '60000000-0000-0000-0000-000000000009',
        code: 'VITAL_LITE_INDIVIDUAL',
        name: 'Vital Lite',
        description: 'Nigerian vital lite plan for individual coverage.',
        annual_premium_price: 155000,
        currency: 'NGN',
        plan_cycle: 'annual',
        allow_dependent_enrolee: false
    },
    {
        id: '60000000-0000-0000-0000-000000000010',
        code: 'VITAL_LITE_FAMILY',
        name: 'Vital Lite',
        description: 'Nigerian vital lite plan for family coverage.',
        annual_premium_price: 837000,
        currency: 'NGN',
        plan_cycle: 'annual',
        allow_dependent_enrolee: true
    },
    {
        id: '60000000-0000-0000-0000-000000000011',
        code: 'VITAL_GROOVE_INDIVIDUAL',
        name: 'Vital Groove',
        description: 'Nigerian vital groove plan for individual coverage.',
        annual_premium_price: 305000,
        currency: 'NGN',
        plan_cycle: 'annual',
        allow_dependent_enrolee: false
    },
    {
        id: '60000000-0000-0000-0000-000000000012',
        code: 'VITAL_GROOVE_FAMILY',
        name: 'Vital Groove',
        description: 'Nigerian vital groove plan for family coverage.',
        annual_premium_price: 1647000,
        currency: 'NGN',
        plan_cycle: 'annual',
        allow_dependent_enrolee: true
    },
    {
        id: '60000000-0000-0000-0000-000000000013',
        code: 'VITAL_PLUS_INDIVIDUAL',
        name: 'Vital Plus',
        description: 'Nigerian vital plus plan for individual coverage.',
        annual_premium_price: 510000,
        currency: 'NGN',
        plan_cycle: 'annual',
        allow_dependent_enrolee: false
    },
    {
        id: '60000000-0000-0000-0000-000000000014',
        code: 'VITAL_PLUS_FAMILY',
        name: 'Vital Plus',
        description: 'Nigerian vital plus plan for family coverage.',
        annual_premium_price: 2754000,
        currency: 'NGN',
        plan_cycle: 'annual',
        allow_dependent_enrolee: true
    },
    {
        id: '60000000-0000-0000-0000-000000000015',
        code: 'VITAL_MAX_INDIVIDUAL',
        name: 'Vital Max',
        description: 'Nigerian vital max plan for individual coverage.',
        annual_premium_price: 720000,
        currency: 'NGN',
        plan_cycle: 'annual',
        allow_dependent_enrolee: false
    },
    {
        id: '60000000-0000-0000-0000-000000000016',
        code: 'VITAL_MAX_FAMILY',
        name: 'Vital Max',
        description: 'Nigerian vital max plan for family coverage.',
        annual_premium_price: 3888000,
        currency: 'NGN',
        plan_cycle: 'annual',
        allow_dependent_enrolee: true
    }
];

module.exports = {
    async up(queryInterface) {
        const transaction = await queryInterface.sequelize.transaction();

        try {
            for (const plan of publicPlans) {
                await queryInterface.sequelize.query(
                    `
                    INSERT INTO plans (
                        id,
                        name,
                        code,
                        description,
                        status,
                        is_active,
                        is_approved,
                        annual_premium_price,
                        currency,
                        plan_cycle,
                        allow_dependent_enrolee,
                        created_at,
                        updated_at
                    )
                    VALUES (
                        :id,
                        :name,
                        :code,
                        :description,
                        'approved',
                        true,
                        true,
                        :annual_premium_price,
                        :currency,
                        :plan_cycle,
                        :allow_dependent_enrolee,
                        NOW(),
                        NOW()
                    )
                    ON CONFLICT (code) DO UPDATE SET
                        name = EXCLUDED.name,
                        description = EXCLUDED.description,
                        status = EXCLUDED.status,
                        is_active = EXCLUDED.is_active,
                        is_approved = EXCLUDED.is_approved,
                        annual_premium_price = EXCLUDED.annual_premium_price,
                        currency = EXCLUDED.currency,
                        plan_cycle = EXCLUDED.plan_cycle,
                        allow_dependent_enrolee = EXCLUDED.allow_dependent_enrolee,
                        updated_at = NOW()
                    `,
                    {
                        replacements: plan,
                        transaction
                    }
                );
            }

            await transaction.commit();
        } catch (err) {
            await transaction.rollback();
            throw err;
        }
    },

    async down(queryInterface) {
        await queryInterface.bulkDelete('plans', {
            code: publicPlans.map((plan) => plan.code)
        });
    }
};
