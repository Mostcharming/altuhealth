'use strict';
const { v4: uuidv4 } = require('uuid');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        const now = new Date();

        await queryInterface.bulkInsert('notification_templates', [
            {
                id: uuidv4(),
                act: 'BIRTHDAY_REMINDER',
                name: 'Birthday Reminder',
                subj: 'Happy Birthday {{name}}! 🎉 Your AltuHealth Wellness Gift Awaits',
                email_body: '<p>Dear {{name}},</p><p></p><p>🎂 <strong>Happy Birthday!</strong> 🎂</p><p></p><p>We hope you have a wonderful day filled with joy, good health, and cherished moments with your loved ones.</p><p></p><p>On your special day, we want to remind you that your health and wellness are our priority. Whether it\'s a routine check-up, consultation with a specialist, or accessing your health records, your AltuHealth account is here to support your healthcare needs.</p><p></p><p><strong>Your Healthcare Benefits:</strong></p><ul><li>Access to our network of trusted healthcare providers</li><li>Coverage for preventive care and treatments</li><li>Easy appointment booking and teleconsultation options</li><li>Comprehensive health records all in one place</li></ul><p></p><p>If you have any dependents with AltuHealth coverage, their benefits are also active and ready to use.</p><p></p><p><a href="{{dashboardLink}}" target="_blank" rel="noopener noreferrer nofollow" style="display: inline-block; padding: 12px 24px; background-color: #28a745; color: white; text-decoration: none; border-radius: 4px; font-weight: bold;">Visit Your Dashboard</a></p><p></p><p>Should you need to schedule a health check-up or have any questions about your coverage, our support team is here to help.</p><p></p><p>Enjoy your special day and here\'s to good health!</p><p></p><p>Best regards,<br>AltuHealth Team</p>',
                sms_body: '🎂 Happy Birthday {{name}}! Here\'s to your health and wellness. Access your AltuHealth dashboard at {{dashboardLink}} for all your healthcare needs. Cheers!',
                shortcodes: '{"name": "Enrollee name", "dashboardLink": "Link to enrollee dashboard"}',
                email_status: true,
                sms_status: true,
                created_at: now,
                updated_at: now
            }
        ], {});
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.bulkDelete('notification_templates', {
            act: 'BIRTHDAY_REMINDER'
        }, {});
    }
};
