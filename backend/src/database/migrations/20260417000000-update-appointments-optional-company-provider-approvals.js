'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        const transaction = await queryInterface.sequelize.transaction();
        try {
            // Make companyId nullable
            await queryInterface.changeColumn(
                'appointments',
                'company_id',
                {
                    type: Sequelize.UUID,
                    allowNull: true,
                    references: {
                        model: 'companies',
                        key: 'id'
                    }
                },
                { transaction }
            );

            // Update approved_by foreign key to reference providers instead of admins
            await queryInterface.removeConstraint(
                'appointments',
                'appointments_approved_by_fkey',
                { transaction }
            );

            await queryInterface.addConstraint(
                'appointments',
                {
                    fields: ['approved_by'],
                    type: 'foreign key',
                    references: {
                        table: 'providers',
                        field: 'id'
                    },
                    name: 'appointments_approved_by_fkey',
                    transaction
                }
            );

            // Update rejected_by foreign key to reference providers instead of admins
            await queryInterface.removeConstraint(
                'appointments',
                'appointments_rejected_by_fkey',
                { transaction }
            );

            await queryInterface.addConstraint(
                'appointments',
                {
                    fields: ['rejected_by'],
                    type: 'foreign key',
                    references: {
                        table: 'providers',
                        field: 'id'
                    },
                    name: 'appointments_rejected_by_fkey',
                    transaction
                }
            );

            await transaction.commit();
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    },

    down: async (queryInterface, Sequelize) => {
        const transaction = await queryInterface.sequelize.transaction();
        try {
            // Revert companyId to not nullable
            await queryInterface.changeColumn(
                'appointments',
                'company_id',
                {
                    type: Sequelize.UUID,
                    allowNull: false,
                    references: {
                        model: 'companies',
                        key: 'id'
                    }
                },
                { transaction }
            );

            // Revert approved_by foreign key to reference admins
            await queryInterface.removeConstraint(
                'appointments',
                'appointments_approved_by_fkey',
                { transaction }
            );

            await queryInterface.addConstraint(
                'appointments',
                {
                    fields: ['approved_by'],
                    type: 'foreign key',
                    references: {
                        table: 'admins',
                        field: 'id'
                    },
                    name: 'appointments_approved_by_fkey',
                    transaction
                }
            );

            // Revert rejected_by foreign key to reference admins
            await queryInterface.removeConstraint(
                'appointments',
                'appointments_rejected_by_fkey',
                { transaction }
            );

            await queryInterface.addConstraint(
                'appointments',
                {
                    fields: ['rejected_by'],
                    type: 'foreign key',
                    references: {
                        table: 'admins',
                        field: 'id'
                    },
                    name: 'appointments_rejected_by_fkey',
                    transaction
                }
            );

            await transaction.commit();
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }
};
