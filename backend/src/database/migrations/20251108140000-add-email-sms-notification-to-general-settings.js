'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.addColumn('general_settings', 'email_notification', {
            type: Sequelize.BOOLEAN,
            allowNull: false,
            defaultValue: false,
        });

        await queryInterface.addColumn('general_settings', 'sms_notification', {
            type: Sequelize.BOOLEAN,
            allowNull: false,
            defaultValue: false,
        });
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.removeColumn('general_settings', 'email_notification');
        await queryInterface.removeColumn('general_settings', 'sms_notification');
    }
};
