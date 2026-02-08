"use strict";

module.exports = {
    up: async (queryInterface, Sequelize) => {
        // add email_status column
        await queryInterface.addColumn("notification_templates", "email_status", {
            type: Sequelize.BOOLEAN,
            allowNull: false,
            defaultValue: false,
        });

        // add sms_status column
        await queryInterface.addColumn("notification_templates", "sms_status", {
            type: Sequelize.BOOLEAN,
            allowNull: false,
            defaultValue: false,
        });
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.removeColumn("notification_templates", "email_status");
        await queryInterface.removeColumn("notification_templates", "sms_status");
    },
};
