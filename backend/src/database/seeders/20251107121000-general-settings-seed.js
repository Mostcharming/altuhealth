'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        const id = '77777777-7777-7777-7777-777777777777';
        const now = new Date();

        await queryInterface.bulkInsert('general_settings', [
            {
                id,
                emailFrom: 'no-reply@altuhealth.com',
                smsFrom: 'ALTU',
                emailTemplate: '<p>Hello {{name}},</p><p>This is a sample email template.</p>',
                smsBody: 'Hello {{name}}, this is a sample SMS message.',
                createdAt: now,
                updatedAt: now
            }
        ], {});
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.bulkDelete('general_settings', { id: ['77777777-7777-7777-7777-777777777777'] }, {});
    }
};
