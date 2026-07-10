'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        const transaction = await queryInterface.sequelize.transaction();

        try {
            for (const tableName of ['plans', 'company_plans']) {
                await queryInterface.addColumn(tableName, 'dependent_age_limits', {
                    type: Sequelize.JSONB,
                    allowNull: true
                }, { transaction });

                await queryInterface.sequelize.query(`
                    UPDATE ${tableName}
                    SET dependent_age_limits = CASE
                        WHEN dependent_age_limit IS NULL
                            OR dependent_age_limit < 0
                            OR dependent_age_limit > 150
                            THEN '{}'::jsonb
                        ELSE jsonb_build_object(
                            'spouse', dependent_age_limit,
                            'child', dependent_age_limit,
                            'parent', dependent_age_limit,
                            'sibling', dependent_age_limit,
                            'other', dependent_age_limit
                        )
                    END
                `, { transaction });

                await queryInterface.changeColumn(tableName, 'dependent_age_limits', {
                    type: Sequelize.JSONB,
                    allowNull: false,
                    defaultValue: {}
                }, { transaction });

                await queryInterface.sequelize.query(`
                    ALTER TABLE ${tableName}
                    ADD CONSTRAINT ${tableName}_dependent_age_limits_object_check
                    CHECK (jsonb_typeof(dependent_age_limits) = 'object')
                `, { transaction });
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
            for (const tableName of ['company_plans', 'plans']) {
                await queryInterface.sequelize.query(`
                    ALTER TABLE ${tableName}
                    DROP CONSTRAINT IF EXISTS ${tableName}_dependent_age_limits_object_check
                `, { transaction });
                await queryInterface.removeColumn(tableName, 'dependent_age_limits', { transaction });
            }

            await transaction.commit();
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }
};
