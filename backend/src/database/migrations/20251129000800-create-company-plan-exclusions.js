'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('company_plan_exclusions', {
            id: {
                type: Sequelize.UUID,
                allowNull: false,
                primaryKey: true,
                defaultValue: Sequelize.UUIDV4
            },
            company_plan_id: {
                type: Sequelize.UUID,
                allowNull: false,
                references: {
                    model: 'company_plans',
                    key: 'id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE'
            },
            exclusion_id: {
                type: Sequelize.UUID,
                allowNull: false,
                references: {
                    model: 'exclusions',
                    key: 'id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE'
            },
            created_at: {
                type: Sequelize.DATE,
                allowNull: false,
                defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
            },
            updated_at: {
                type: Sequelize.DATE,
                allowNull: false,
                defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
            }
        });

        // Add composite unique index to prevent duplicates
        await queryInterface.addIndex('company_plan_exclusions', ['company_plan_id', 'exclusion_id'], {
            unique: true
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('company_plan_exclusions');
    }
};
