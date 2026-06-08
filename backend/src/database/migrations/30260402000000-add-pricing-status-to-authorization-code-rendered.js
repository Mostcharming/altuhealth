'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.addColumn('authorization_code_rendered', 'item_name', {
            type: Sequelize.STRING,
            allowNull: true
        });
        await queryInterface.addColumn('authorization_code_rendered', 'unit_price', {
            type: Sequelize.DECIMAL(12, 2),
            allowNull: true
        });
        await queryInterface.addColumn('authorization_code_rendered', 'line_amount', {
            type: Sequelize.DECIMAL(12, 2),
            allowNull: true
        });
        await queryInterface.addColumn('authorization_code_rendered', 'status', {
            type: Sequelize.ENUM('pending', 'approved', 'rejected'),
            allowNull: false,
            defaultValue: 'pending'
        });
    },

    async down(queryInterface) {
        await queryInterface.removeColumn('authorization_code_rendered', 'status');
        await queryInterface.removeColumn('authorization_code_rendered', 'line_amount');
        await queryInterface.removeColumn('authorization_code_rendered', 'unit_price');
        await queryInterface.removeColumn('authorization_code_rendered', 'item_name');
        await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_authorization_code_rendered_status";');
    }
};
