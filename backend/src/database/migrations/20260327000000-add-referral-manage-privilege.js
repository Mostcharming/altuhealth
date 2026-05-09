'use strict';
const { v4: uuidv4 } = require('uuid');

module.exports = {
    up: async (queryInterface, Sequelize) => {
        const now = new Date();
        const superRoleId = '22222222-2222-2222-2222-222222222222';

        // Insert the new privilege
        const privilegeId = uuidv4();
        await queryInterface.sequelize.query(
            `INSERT INTO privileges (id, name, description, created_at, updated_at) 
             VALUES (:id, :name, :description, :createdAt, :updatedAt)`,
            {
                replacements: {
                    id: privilegeId,
                    name: 'referral.manage',
                    description: 'Manage referrals and referral settings',
                    createdAt: now,
                    updatedAt: now
                }
            }
        );

        // Assign the privilege to the super admin role
        await queryInterface.sequelize.query(
            `INSERT INTO role_privileges (id, role_id, privilege_id, created_at, updated_at) 
             VALUES (:id, :roleId, :privilegeId, :createdAt, :updatedAt)`,
            {
                replacements: {
                    id: uuidv4(),
                    roleId: superRoleId,
                    privilegeId: privilegeId,
                    createdAt: now,
                    updatedAt: now
                }
            }
        );
    },

    down: async (queryInterface, Sequelize) => {
        // Remove the privilege from role_privileges
        await queryInterface.sequelize.query(
            `DELETE FROM role_privileges WHERE privilege_id IN 
             (SELECT id FROM privileges WHERE name = :name)`,
            {
                replacements: { name: 'referral.manage' }
            }
        );

        // Delete the privilege
        await queryInterface.sequelize.query(
            `DELETE FROM privileges WHERE name = :name`,
            {
                replacements: { name: 'referral.manage' }
            }
        );
    }
};
