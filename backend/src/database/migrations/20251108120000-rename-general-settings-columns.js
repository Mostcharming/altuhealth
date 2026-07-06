'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await Promise.all([
            queryInterface.renameColumn('general_settings', 'emailFrom', 'email_from'),
            queryInterface.renameColumn('general_settings', 'smsFrom', 'sms_from'),
            queryInterface.renameColumn('general_settings', 'emailTemplate', 'email_template'),
            queryInterface.renameColumn('general_settings', 'smsBody', 'sms_body'),
            queryInterface.renameColumn('general_settings', 'mailConfig', 'mail_config'),
            queryInterface.renameColumn('general_settings', 'smsConfig', 'sms_config')
        ]);
    },

    async down(queryInterface, Sequelize) {
        await Promise.all([
            queryInterface.renameColumn('general_settings', 'email_from', 'emailFrom'),
            queryInterface.renameColumn('general_settings', 'sms_from', 'smsFrom'),
            queryInterface.renameColumn('general_settings', 'email_template', 'emailTemplate'),
            queryInterface.renameColumn('general_settings', 'sms_body', 'smsBody'),
            queryInterface.renameColumn('general_settings', 'mail_config', 'mailConfig'),
            queryInterface.renameColumn('general_settings', 'sms_config', 'smsConfig')
        ]);
    }
};
