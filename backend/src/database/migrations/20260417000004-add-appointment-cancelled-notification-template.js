'use strict';
const { v4: uuidv4 } = require('uuid');

module.exports = {
    up: async (queryInterface, Sequelize) => {
        const now = new Date();

        await queryInterface.bulkInsert('notification_templates', [
            {
                id: uuidv4(),
                act: 'APPOINTMENT_CANCELLED_BY_ENROLLEE',
                name: 'Appointment Cancelled by Enrollee',
                subj: 'Appointment Cancelled - {{enrolleeName}} | {{appointmentDateTime}}',
                email_body: '<p>Dear {{providerName}},</p><p></p><p>An appointment has been cancelled by the patient.</p><p></p><p><strong>Appointment Details:</strong></p><ul><li><strong>Patient Name:</strong> {{enrolleeName}}</li><li><strong>Original Scheduled Date & Time:</strong> {{appointmentDateTime}}</li><li><strong>Status:</strong> Cancelled</li></ul><p></p><p>The time slot is now available for other patient appointments. You can review all your appointments in the provider portal.</p><p></p><p><a href="{{providerPortalLink}}" target="_blank" rel="noopener noreferrer nofollow" style="display: inline-block; padding: 12px 24px; background-color: #dc3545; color: white; text-decoration: none; border-radius: 4px; font-weight: bold;">View Appointments</a></p><p></p><p>If you have any questions regarding this cancellation, please contact the patient or our support team.</p><p></p><p>Best regards,<br>AltuHealth Team</p>',
                sms_body: 'Appointment cancelled by {{enrolleeName}}. Original date: {{appointmentDateTime}}. Check your portal at {{providerPortalLink}}',
                shortcodes: '{"enrolleeName": "Enrollee full name", "providerName": "Provider name", "appointmentDateTime": "Formatted appointment date and time", "providerPortalLink": "Link to provider appointments dashboard"}',
                email_status: true,
                sms_status: false,
                created_at: now,
                updated_at: now
            }
        ], {});
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.bulkDelete('notification_templates', {
            act: 'APPOINTMENT_CANCELLED_BY_ENROLLEE'
        }, {});
    }
};
