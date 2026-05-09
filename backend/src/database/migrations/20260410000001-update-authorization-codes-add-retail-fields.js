'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        // Make enrollee_id nullable
        await queryInterface.changeColumn('authorization_codes', 'enrollee_id', {
            type: Sequelize.UUID,
            allowNull: true,
            references: {
                model: 'enrollees',
                key: 'id'
            },
            onUpdate: 'CASCADE',
            onDelete: 'CASCADE'
        });

        // Make company_id nullable
        await queryInterface.changeColumn('authorization_codes', 'company_id', {
            type: Sequelize.UUID,
            allowNull: true,
            references: {
                model: 'companies',
                key: 'id'
            },
            onUpdate: 'CASCADE',
            onDelete: 'RESTRICT'
        });

        // Add new columns for enrollee dependent id
        await queryInterface.addColumn('authorization_codes', 'enrollee_dependent_id', {
            type: Sequelize.UUID,
            allowNull: true,
            references: {
                model: 'enrollee_dependents',
                key: 'id'
            },
            onUpdate: 'CASCADE',
            onDelete: 'CASCADE'
        });

        // Add new columns for retail enrollee id
        await queryInterface.addColumn('authorization_codes', 'retail_enrollee_id', {
            type: Sequelize.UUID,
            allowNull: true,
            references: {
                model: 'retail_enrollees',
                key: 'id'
            },
            onUpdate: 'CASCADE',
            onDelete: 'CASCADE'
        });

        // Add new columns for retail enrollee dependent id
        await queryInterface.addColumn('authorization_codes', 'retail_enrollee_dependent_id', {
            type: Sequelize.UUID,
            allowNull: true,
            references: {
                model: 'retail_enrollee_dependents',
                key: 'id'
            },
            onUpdate: 'CASCADE',
            onDelete: 'CASCADE'
        });

        // Add indexes
        await queryInterface.addIndex('authorization_codes', ['enrollee_dependent_id']);
        await queryInterface.addIndex('authorization_codes', ['retail_enrollee_id']);
        await queryInterface.addIndex('authorization_codes', ['retail_enrollee_dependent_id']);
    },

    async down(queryInterface, Sequelize) {
        // Remove indexes
        await queryInterface.removeIndex('authorization_codes', ['enrollee_dependent_id']);
        await queryInterface.removeIndex('authorization_codes', ['retail_enrollee_id']);
        await queryInterface.removeIndex('authorization_codes', ['retail_enrollee_dependent_id']);

        // Remove columns
        await queryInterface.removeColumn('authorization_codes', 'enrollee_dependent_id');
        await queryInterface.removeColumn('authorization_codes', 'retail_enrollee_id');
        await queryInterface.removeColumn('authorization_codes', 'retail_enrollee_dependent_id');

        // Revert enrollee_id to not null
        await queryInterface.changeColumn('authorization_codes', 'enrollee_id', {
            type: Sequelize.UUID,
            allowNull: false,
            references: {
                model: 'enrollees',
                key: 'id'
            },
            onUpdate: 'CASCADE',
            onDelete: 'CASCADE'
        });

        // Revert company_id to not null
        await queryInterface.changeColumn('authorization_codes', 'company_id', {
            type: Sequelize.UUID,
            allowNull: false,
            references: {
                model: 'companies',
                key: 'id'
            },
            onUpdate: 'CASCADE',
            onDelete: 'RESTRICT'
        });
    }
};
