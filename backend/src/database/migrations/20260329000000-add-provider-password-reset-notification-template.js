'use strict';
const { v4: uuidv4 } = require('uuid');

module.exports = {
    up: async (queryInterface, Sequelize) => {
        const now = new Date();

        await queryInterface.bulkInsert('notification_templates', [
            {
                id: uuidv4(),
                act: 'PROVIDER_PASSWORD_RESET',
                name: 'Provider Password Reset',
                subj: 'Your Password Has Been Reset – AltuHealth Provider Portal',
                email_body: '<p>Dear {{name}},</p><p></p><p>Your password has been reset as requested. Below are your login details:</p><p></p><p><strong>Email:</strong> {{email}}</p><p><strong>Temporary Password:</strong> {{password}}</p><p></p><p>You can log in using the link below:</p><p><a target="_blank" rel="noopener noreferrer nofollow" href="https://provider.altuhealth.com/">https://provider.altuhealth.com/</a></p><p></p><p>You may keep this password or change it to something more secure after your first login. For security reasons, we recommend changing your password regularly.</p><p></p><p>If you did not request this password reset, please contact our support team immediately.</p><p></p><p>Best regards,<br>AltuHealth Support Team</p>',
                sms_body: 'Your AltuHealth password has been reset. Temp password: {{password}}. Login at https://provider.altuhealth.com/ and change it after first login. For support, contact our team.',
                shortcodes: '{"name": "Provider name","email": "Provider email address","password": "Temporary password" }',
                email_status: true,
                sms_status: true,
                created_at: now,
                updated_at: now
            }
        ], {});
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.bulkDelete('notification_templates', {
            act: 'PROVIDER_PASSWORD_RESET'
        }, {});
    }
};
