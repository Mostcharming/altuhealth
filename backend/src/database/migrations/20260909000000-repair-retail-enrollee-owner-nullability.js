'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface) {
        const transaction = await queryInterface.sequelize.transaction();

        try {
            // The original retail-enrollee migration used changeColumn together
            // with a references option. Sequelize's Postgres query generator did
            // not emit DROP NOT NULL in that case, despite allowNull being true.
            await queryInterface.sequelize.query(
                'ALTER TABLE "appointments" ALTER COLUMN "enrollee_id" DROP NOT NULL',
                { transaction }
            );
            await queryInterface.sequelize.query(
                'ALTER TABLE "period_trackers" ALTER COLUMN "enrollee_id" DROP NOT NULL',
                { transaction }
            );

            await transaction.commit();
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    },

    async down(queryInterface) {
        const transaction = await queryInterface.sequelize.transaction();

        try {
            await queryInterface.sequelize.query(
                'ALTER TABLE "period_trackers" ALTER COLUMN "enrollee_id" SET NOT NULL',
                { transaction }
            );
            await queryInterface.sequelize.query(
                'ALTER TABLE "appointments" ALTER COLUMN "enrollee_id" SET NOT NULL',
                { transaction }
            );

            await transaction.commit();
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }
};
