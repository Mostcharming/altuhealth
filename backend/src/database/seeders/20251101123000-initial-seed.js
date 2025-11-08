'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        const adminId = '11111111-1111-1111-1111-111111111111';
        const roleId = '22222222-2222-2222-2222-222222222222';
        const unitId = '33333333-3333-3333-3333-333333333333';
        const policyId = '44444444-4444-4444-4444-444444444444';

        const now = new Date();

        // Insert one admin
        await queryInterface.bulkInsert('admins', [
            {
                id: adminId,
                first_name: 'System',
                last_name: 'Admin',
                email: 'admin@example.com',
                password_hash: 'changeme',
                phone_number: '0000000000',
                picture: null,
                state: null,
                country: null,
                current_location: null,
                latitude: null,
                longitude: null,
                address: null,
                city: null,
                postal_code: null,
                status: 'active',
                is_deleted: false,
                created_at: now,
                updated_at: now
            }
        ], {});

        // Insert one role
        await queryInterface.bulkInsert('roles', [
            {
                id: roleId,
                name: 'super_admin',
                description: 'Initial super admin role',
                created_at: now,
                updated_at: now
            }
        ], {});

        // Insert one unit
        await queryInterface.bulkInsert('units', [
            {
                id: unitId,
                name: 'Default Unit',
                description: 'Default measurement or organizational unit',
                created_at: now,
                updated_at: now
            }
        ], {});

        // Insert one policy number (linked to admin)
        await queryInterface.bulkInsert('policy_numbers', [
            {
                id: policyId,
                policy_number: 'POLICY-0001',
                provider_name: 'Default Provider',
                user_id: adminId,
                user_type: 'admin',
                coverage_details: 'Default coverage for seed data',
                valid_from: now,
                valid_to: new Date(now.getFullYear() + 1, now.getMonth(), now.getDate()),
                created_at: now,
                updated_at: now
            }
        ], {});

        // Link admin -> role
        await queryInterface.bulkInsert('user_roles', [
            {
                id: '55555555-5555-5555-5555-555555555555',
                user_id: adminId,
                user_type: 'admin',
                role_id: roleId,
                created_at: now,
                updated_at: now
            }
        ], {});

        // Link admin -> unit
        await queryInterface.bulkInsert('user_units', [
            {
                id: '66666666-6666-6666-6666-666666666666',
                user_id: adminId,
                user_type: 'admin',
                unit_id: unitId,
                created_at: now,
                updated_at: now
            }
        ], {});
    },

    async down(queryInterface, Sequelize) {
        // Remove seeded rows by id
        await queryInterface.bulkDelete('user_units', { id: ['66666666-6666-6666-6666-666666666666'] }, {});
        await queryInterface.bulkDelete('user_roles', { id: ['55555555-5555-5555-5555-555555555555'] }, {});
        await queryInterface.bulkDelete('policy_numbers', { id: ['44444444-4444-4444-4444-444444444444'] }, {});
        await queryInterface.bulkDelete('units', { id: ['33333333-3333-3333-3333-333333333333'] }, {});
        await queryInterface.bulkDelete('roles', { id: ['22222222-2222-2222-2222-222222222222'] }, {});
        await queryInterface.bulkDelete('admins', { id: ['11111111-1111-1111-1111-111111111111'] }, {});
    }
};
