'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        const transaction = await queryInterface.sequelize.transaction();
        try {
            // Check if column already exists
            const tableDescription = await queryInterface.describeTable('company_plans', { transaction });
            
            if (!tableDescription.currency) {
                await queryInterface.addColumn(
                    'company_plans',
                    'currency',
                    {
                        type: Sequelize.STRING(3),
                        allowNull: false,
                        defaultValue: 'NGN',
                        field: 'currency'
                    },
                    { transaction }
                );
            }

            await transaction.commit();
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    },

    async down(queryInterface, Sequelize) {
        const transaction = await queryInterface.sequelize.transaction();
        try {
            const tableDescription = await queryInterface.describeTable('company_plans', { transaction });
            
            if (tableDescription.currency) {
                await queryInterface.removeColumn('company_plans', 'currency', { transaction });
            }

            await transaction.commit();
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }
};
