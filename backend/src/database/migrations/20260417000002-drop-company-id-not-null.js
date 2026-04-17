'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        const transaction = await queryInterface.sequelize.transaction();
        try {
            // Make companyId nullable by using raw SQL
            await queryInterface.sequelize.query(
                'ALTER TABLE appointments ALTER COLUMN company_id DROP NOT NULL',
                { transaction }
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
            await queryInterface.sequelize.query(
                'ALTER TABLE appointments ALTER COLUMN company_id SET NOT NULL',
                { transaction }
            );

            await transaction.commit();
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }
};
