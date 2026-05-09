'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.sequelize.transaction(async (transaction) => {
            // Rename reason to reason_for_code if it exists
            const tableDescription = await queryInterface.describeTable('authorization_codes', { transaction });

            if (tableDescription.reason) {
                await queryInterface.renameColumn('authorization_codes', 'reason', 'reason_for_code', { transaction });
            }

            // Add new columns
            await queryInterface.addColumn('authorization_codes', 'company_id', {
                type: Sequelize.UUID,
                allowNull: false,
                references: {
                    model: 'companies',
                    key: 'id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'RESTRICT'
            }, { transaction });

            await queryInterface.addColumn('authorization_codes', 'company_plan_id', {
                type: Sequelize.UUID,
                allowNull: true,
                references: {
                    model: 'company_plans',
                    key: 'id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'SET NULL'
            }, { transaction });

            await queryInterface.addColumn('authorization_codes', 'approved_by', {
                type: Sequelize.UUID,
                allowNull: true,
                references: {
                    model: 'admins',
                    key: 'id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'SET NULL'
            }, { transaction });

            await queryInterface.addColumn('authorization_codes', 'date_time_requested', {
                type: Sequelize.DATE,
                allowNull: false,
                defaultValue: Sequelize.NOW
            }, { transaction });

            await queryInterface.addColumn('authorization_codes', 'date_time_given', {
                type: Sequelize.DATE,
                allowNull: true
            }, { transaction });

            await queryInterface.addColumn('authorization_codes', 'approval_note', {
                type: Sequelize.TEXT,
                allowNull: true
            }, { transaction });

            // Remove plan_id column if it exists and replace with company_plan_id
            if (tableDescription.plan_id) {
                await queryInterface.removeConstraint('authorization_codes', 'authorization_codes_plan_id_fkey', { transaction }).catch(() => { });
                await queryInterface.removeColumn('authorization_codes', 'plan_id', { transaction });
            }
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.sequelize.transaction(async (transaction) => {
            // Remove new columns
            const tableDescription = await queryInterface.describeTable('authorization_codes', { transaction });

            if (tableDescription.approval_note) {
                await queryInterface.removeColumn('authorization_codes', 'approval_note', { transaction });
            }

            if (tableDescription.date_time_given) {
                await queryInterface.removeColumn('authorization_codes', 'date_time_given', { transaction });
            }

            if (tableDescription.date_time_requested) {
                await queryInterface.removeColumn('authorization_codes', 'date_time_requested', { transaction });
            }

            if (tableDescription.approved_by) {
                await queryInterface.removeConstraint('authorization_codes', 'authorization_codes_approved_by_fkey', { transaction }).catch(() => { });
                await queryInterface.removeColumn('authorization_codes', 'approved_by', { transaction });
            }

            if (tableDescription.company_plan_id) {
                await queryInterface.removeConstraint('authorization_codes', 'authorization_codes_company_plan_id_fkey', { transaction }).catch(() => { });
                await queryInterface.removeColumn('authorization_codes', 'company_plan_id', { transaction });
            }

            if (tableDescription.company_id) {
                await queryInterface.removeConstraint('authorization_codes', 'authorization_codes_company_id_fkey', { transaction }).catch(() => { });
                await queryInterface.removeColumn('authorization_codes', 'company_id', { transaction });
            }

            // Restore reason_for_code back to reason
            if (tableDescription.reason_for_code && !tableDescription.reason) {
                await queryInterface.renameColumn('authorization_codes', 'reason_for_code', 'reason', { transaction });
            }

            // Restore plan_id column
            await queryInterface.addColumn('authorization_codes', 'plan_id', {
                type: Sequelize.UUID,
                allowNull: true,
                references: {
                    model: 'plans',
                    key: 'id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'SET NULL'
            }, { transaction });
        });
    }
};
