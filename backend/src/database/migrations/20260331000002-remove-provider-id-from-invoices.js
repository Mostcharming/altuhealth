'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.removeColumn('invoices', 'provider_id');
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.addColumn('invoices', 'provider_id', {
            type: Sequelize.UUID,
            allowNull: true,
            references: {
                model: 'providers',
                key: 'id'
            },
            onDelete: 'SET NULL',
            onUpdate: 'CASCADE',
            field: 'provider_id'
        });
    }
};
