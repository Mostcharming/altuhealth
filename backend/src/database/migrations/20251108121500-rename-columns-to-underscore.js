'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        // Rename columns in admins
        await Promise.all([
            queryInterface.renameColumn('admins', 'firstName', 'first_name'),
            queryInterface.renameColumn('admins', 'lastName', 'last_name'),
            queryInterface.renameColumn('admins', 'passwordHash', 'password_hash'),
            queryInterface.renameColumn('admins', 'phoneNumber', 'phone_number'),
            queryInterface.renameColumn('admins', 'currentLocation', 'current_location'),
            queryInterface.renameColumn('admins', 'postalCode', 'postal_code'),
            queryInterface.renameColumn('admins', 'isDeleted', 'is_deleted'),
            queryInterface.renameColumn('admins', 'createdAt', 'created_at'),
            queryInterface.renameColumn('admins', 'updatedAt', 'updated_at')
        ]);

        // Rename columns in policy_numbers
        await Promise.all([
            queryInterface.renameColumn('policy_numbers', 'policyNumber', 'policy_number'),
            queryInterface.renameColumn('policy_numbers', 'providerName', 'provider_name'),
            queryInterface.renameColumn('policy_numbers', 'userId', 'user_id'),
            queryInterface.renameColumn('policy_numbers', 'userType', 'user_type'),
            queryInterface.renameColumn('policy_numbers', 'coverageDetails', 'coverage_details'),
            queryInterface.renameColumn('policy_numbers', 'validFrom', 'valid_from'),
            queryInterface.renameColumn('policy_numbers', 'validTo', 'valid_to'),
            queryInterface.renameColumn('policy_numbers', 'createdAt', 'created_at'),
            queryInterface.renameColumn('policy_numbers', 'updatedAt', 'updated_at')
        ]);

        // Rename columns in user_roles
        await Promise.all([
            queryInterface.renameColumn('user_roles', 'userId', 'user_id'),
            queryInterface.renameColumn('user_roles', 'userType', 'user_type'),
            queryInterface.renameColumn('user_roles', 'roleId', 'role_id'),
            queryInterface.renameColumn('user_roles', 'createdAt', 'created_at'),
            queryInterface.renameColumn('user_roles', 'updatedAt', 'updated_at')
        ]);

        // Rename columns in user_units
        await Promise.all([
            queryInterface.renameColumn('user_units', 'userId', 'user_id'),
            queryInterface.renameColumn('user_units', 'userType', 'user_type'),
            queryInterface.renameColumn('user_units', 'unitId', 'unit_id'),
            queryInterface.renameColumn('user_units', 'createdAt', 'created_at'),
            queryInterface.renameColumn('user_units', 'updatedAt', 'updated_at')
        ]);

        // Rename createdAt/updatedAt in roles and units (name/description already underscored)
        await Promise.all([
            queryInterface.renameColumn('roles', 'createdAt', 'created_at'),
            queryInterface.renameColumn('roles', 'updatedAt', 'updated_at'),
            queryInterface.renameColumn('units', 'createdAt', 'created_at'),
            queryInterface.renameColumn('units', 'updatedAt', 'updated_at')
        ]);

        // Note: general_settings was handled in a separate migration.
    },

    async down(queryInterface, Sequelize) {
        // Revert administrators
        await Promise.all([
            queryInterface.renameColumn('admins', 'first_name', 'firstName'),
            queryInterface.renameColumn('admins', 'last_name', 'lastName'),
            queryInterface.renameColumn('admins', 'password_hash', 'passwordHash'),
            queryInterface.renameColumn('admins', 'phone_number', 'phoneNumber'),
            queryInterface.renameColumn('admins', 'current_location', 'currentLocation'),
            queryInterface.renameColumn('admins', 'postal_code', 'postalCode'),
            queryInterface.renameColumn('admins', 'is_deleted', 'isDeleted'),
            queryInterface.renameColumn('admins', 'created_at', 'createdAt'),
            queryInterface.renameColumn('admins', 'updated_at', 'updatedAt')
        ]);

        // Revert policy_numbers
        await Promise.all([
            queryInterface.renameColumn('policy_numbers', 'policy_number', 'policyNumber'),
            queryInterface.renameColumn('policy_numbers', 'provider_name', 'providerName'),
            queryInterface.renameColumn('policy_numbers', 'user_id', 'userId'),
            queryInterface.renameColumn('policy_numbers', 'user_type', 'userType'),
            queryInterface.renameColumn('policy_numbers', 'coverage_details', 'coverageDetails'),
            queryInterface.renameColumn('policy_numbers', 'valid_from', 'validFrom'),
            queryInterface.renameColumn('policy_numbers', 'valid_to', 'validTo'),
            queryInterface.renameColumn('policy_numbers', 'created_at', 'createdAt'),
            queryInterface.renameColumn('policy_numbers', 'updated_at', 'updatedAt')
        ]);

        // Revert user_roles
        await Promise.all([
            queryInterface.renameColumn('user_roles', 'user_id', 'userId'),
            queryInterface.renameColumn('user_roles', 'user_type', 'userType'),
            queryInterface.renameColumn('user_roles', 'role_id', 'roleId'),
            queryInterface.renameColumn('user_roles', 'created_at', 'createdAt'),
            queryInterface.renameColumn('user_roles', 'updated_at', 'updatedAt')
        ]);

        // Revert user_units
        await Promise.all([
            queryInterface.renameColumn('user_units', 'user_id', 'userId'),
            queryInterface.renameColumn('user_units', 'user_type', 'userType'),
            queryInterface.renameColumn('user_units', 'unit_id', 'unitId'),
            queryInterface.renameColumn('user_units', 'created_at', 'createdAt'),
            queryInterface.renameColumn('user_units', 'updated_at', 'updatedAt')
        ]);

        // Revert roles and units timestamps
        await Promise.all([
            queryInterface.renameColumn('roles', 'created_at', 'createdAt'),
            queryInterface.renameColumn('roles', 'updated_at', 'updatedAt'),
            queryInterface.renameColumn('units', 'created_at', 'createdAt'),
            queryInterface.renameColumn('units', 'updated_at', 'updatedAt')
        ]);

        // Note: general_settings revert handled by its migration.
    }
};
