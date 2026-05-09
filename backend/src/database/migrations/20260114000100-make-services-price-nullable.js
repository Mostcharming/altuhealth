'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        const transaction = await queryInterface.sequelize.transaction();
        try {
            // Make price column nullable to support rate-based pricing
            // Services with rate-based pricing won't have a fixed price value
            await queryInterface.changeColumn(
                'services',
                'price',
                {
                    type: Sequelize.DECIMAL(12, 2),
                    allowNull: true,
                    field: 'price'
                },
                { transaction }
            );

            await transaction.commit();
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    },

    async down(queryInterface, Sequelize) {
        const transaction = await queryInterface.sequelize.transaction();
        try {
            // Restore price column to NOT NULL by setting NULL values to 0
            await queryInterface.sequelize.query(
                'UPDATE services SET price = 0 WHERE price IS NULL',
                { transaction }
            );

            // Restore price column to NOT NULL constraint
            await queryInterface.changeColumn(
                'services',
                'price',
                {
                    type: Sequelize.DECIMAL(12, 2),
                    allowNull: false,
                    field: 'price'
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
