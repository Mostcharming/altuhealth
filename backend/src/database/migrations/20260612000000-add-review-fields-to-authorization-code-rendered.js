'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.sequelize.query(
            'ALTER TYPE "enum_authorization_code_rendered_status" ADD VALUE IF NOT EXISTS \'partial\';'
        );

        await queryInterface.addColumn('authorization_code_rendered', 'approved_amount', {
            type: Sequelize.DECIMAL(12, 2),
            allowNull: true
        });

        await queryInterface.addColumn('authorization_code_rendered', 'admin_comment', {
            type: Sequelize.TEXT,
            allowNull: true
        });

        await queryInterface.addColumn('authorization_code_rendered', 'reviewed_by', {
            type: Sequelize.UUID,
            allowNull: true,
            references: {
                model: 'admins',
                key: 'id'
            },
            onUpdate: 'CASCADE',
            onDelete: 'SET NULL'
        });

        await queryInterface.addColumn('authorization_code_rendered', 'reviewed_at', {
            type: Sequelize.DATE,
            allowNull: true
        });
    },

    async down(queryInterface) {
        await queryInterface.removeColumn('authorization_code_rendered', 'reviewed_at');
        await queryInterface.removeColumn('authorization_code_rendered', 'reviewed_by');
        await queryInterface.removeColumn('authorization_code_rendered', 'admin_comment');
        await queryInterface.removeColumn('authorization_code_rendered', 'approved_amount');
    }
};
