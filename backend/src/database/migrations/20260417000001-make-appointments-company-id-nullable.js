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

            await transaction.commit();
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }
};
