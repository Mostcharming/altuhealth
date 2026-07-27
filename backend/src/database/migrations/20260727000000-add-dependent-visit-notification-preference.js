'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        const transaction = await queryInterface.sequelize.transaction();

        try {
            for (const tableName of ['enrollees', 'retail_enrollees']) {
                await queryInterface.addColumn(tableName, 'dependent_visit_notifications_enabled', {
                    type: Sequelize.BOOLEAN,
                    allowNull: true,
                    defaultValue: null,
                    comment: 'Also controls whether the primary enrollee can view dependent medical history'
                }, { transaction });
            }

            await transaction.commit();
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    },

    async down(queryInterface) {
        const transaction = await queryInterface.sequelize.transaction();

        try {
            for (const tableName of ['retail_enrollees', 'enrollees']) {
                await queryInterface.removeColumn(
                    tableName,
                    'dependent_visit_notifications_enabled',
                    { transaction }
                );
            }

            await transaction.commit();
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }
};
