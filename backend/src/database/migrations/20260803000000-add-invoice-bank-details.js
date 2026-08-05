'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.sequelize.transaction(async transaction => {
            await queryInterface.addColumn('general_settings', 'invoice_bank_details', {
                type: Sequelize.JSON,
                allowNull: true
            }, { transaction });

            await queryInterface.addColumn('invoices', 'bank_details', {
                type: Sequelize.JSON,
                allowNull: true,
                comment: 'Snapshot of the payment bank details shown when this invoice was issued'
            }, { transaction });
        });
    },

    down: async queryInterface => {
        await queryInterface.sequelize.transaction(async transaction => {
            await queryInterface.removeColumn('invoices', 'bank_details', { transaction });
            await queryInterface.removeColumn('general_settings', 'invoice_bank_details', { transaction });
        });
    }
};
