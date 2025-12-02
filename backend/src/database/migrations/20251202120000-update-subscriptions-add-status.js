'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        const transaction = await queryInterface.sequelize.transaction();
        try {
            // Add the status column with ENUM type
            await queryInterface.addColumn(
                'subscriptions',
                'status',
                {
                    type: Sequelize.ENUM('active', 'suspended', 'inactive', 'expired'),
                    allowNull: true,
                    defaultValue: 'active'
                },
                { transaction }
            );

            // Migrate data: convert is_active boolean to status
            // is_active = true -> status = 'active'
            // is_active = false -> status = 'inactive'
            await queryInterface.sequelize.query(
                `UPDATE subscriptions 
                 SET status = CASE 
                     WHEN is_active = true THEN 'active'::enum_subscriptions_status
                     WHEN is_active = false THEN 'inactive'::enum_subscriptions_status
                 END
                 WHERE status IS NULL`,
                { transaction }
            );

            // Make status NOT NULL after populating data
            await queryInterface.changeColumn(
                'subscriptions',
                'status',
                {
                    type: Sequelize.ENUM('active', 'suspended', 'inactive', 'expired'),
                    allowNull: false,
                    defaultValue: 'active'
                },
                { transaction }
            );

            // Remove the old is_active column
            await queryInterface.removeColumn('subscriptions', 'is_active', { transaction });

            await transaction.commit();
        } catch (err) {
            await transaction.rollback();
            throw err;
        }
    },

    async down(queryInterface, Sequelize) {
        const transaction = await queryInterface.sequelize.transaction();
        try {
            // Add back the is_active column
            await queryInterface.addColumn(
                'subscriptions',
                'is_active',
                {
                    type: Sequelize.BOOLEAN,
                    allowNull: false,
                    defaultValue: true
                },
                { transaction }
            );

            // Migrate data back: convert status to is_active boolean
            // status = 'active' -> is_active = true
            // all others -> is_active = false
            await queryInterface.sequelize.query(
                `UPDATE subscriptions 
                 SET is_active = CASE 
                     WHEN status = 'active'::enum_subscriptions_status THEN true
                     ELSE false
                 END`,
                { transaction }
            );

            // Remove the status column
            await queryInterface.removeColumn('subscriptions', 'status', { transaction });

            // Drop the ENUM type for Postgres
            if (queryInterface.sequelize.getDialect() === 'postgres') {
                await queryInterface.sequelize.query(
                    "DROP TYPE IF EXISTS \"enum_subscriptions_status\";",
                    { transaction }
                );
            }

            await transaction.commit();
        } catch (err) {
            await transaction.rollback();
            throw err;
        }
    }
};
