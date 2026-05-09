'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        const id = '77777777-7777-7777-7777-777777777777';
        const now = new Date();

        await queryInterface.bulkInsert('general_settings', [
            {
                id,
                email_from: 'no-reply@altuhealth.com',
                sms_from: 'ALTU',
                email_template: '<p>Hello {{name}},</p><p>This is a sample email template.</p>',
                sms_body: 'Hello {{name}}, this is a sample SMS message.',
                createdAt: now,
                updatedAt: now
            }
        ], {});
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.bulkDelete('general_settings', { id: ['77777777-7777-7777-7777-777777777777'] }, {});
    }
};
