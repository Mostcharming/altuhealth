'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        const transaction = await queryInterface.sequelize.transaction();
        try {
            // Add new pricing columns
            await queryInterface.addColumn(
                'services',
                'price_type',
                {
                    type: Sequelize.ENUM('fixed', 'rate'),
                    allowNull: true,
                    defaultValue: 'fixed',
                    field: 'price_type'
                },
                { transaction }
            );

            await queryInterface.addColumn(
                'services',
                'fixed_price',
                {
                    type: Sequelize.DECIMAL(12, 2),
                    allowNull: true,
                    field: 'fixed_price'
                },
                { transaction }
            );

            await queryInterface.addColumn(
                'services',
                'rate_type',
                {
                    type: Sequelize.ENUM(
                        'per_session',
                        'per_visit',
                        'per_hour',
                        'per_day',
                        'per_week',
                        'per_month',
                        'per_consultation',
                        'per_procedure',
                        'per_unit',
                        'per_mile'
                    ),
                    allowNull: true,
                    field: 'rate_type'
                },
                { transaction }
            );

            await queryInterface.addColumn(
                'services',
                'rate_amount',
                {
                    type: Sequelize.DECIMAL(12, 2),
                    allowNull: true,
                    field: 'rate_amount'
                },
                { transaction }
            );

            // Migrate existing price data to fixed_price
            await queryInterface.sequelize.query(
                'UPDATE services SET fixed_price = price, price_type = \'fixed\' WHERE price IS NOT NULL',
                { transaction }
            );

            // Now we can make price column nullable (optional - can remove later if needed)
            // For now, keeping it for backwards compatibility

            await transaction.commit();
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    },

    async down(queryInterface, Sequelize) {
        const transaction = await queryInterface.sequelize.transaction();
        try {
            // Restore data from fixed_price to price if needed
            await queryInterface.sequelize.query(
                'UPDATE services SET price = fixed_price WHERE price_type = \'fixed\'',
                { transaction }
            );

            // Remove new columns
            await queryInterface.removeColumn('services', 'price_type', { transaction });
            await queryInterface.removeColumn('services', 'fixed_price', { transaction });
            await queryInterface.removeColumn('services', 'rate_type', { transaction });
            await queryInterface.removeColumn('services', 'rate_amount', { transaction });

            await transaction.commit();
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }
};
