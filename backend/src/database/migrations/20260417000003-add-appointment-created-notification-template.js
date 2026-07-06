'use strict';
const { v4: uuidv4 } = require('uuid');

module.exports = {
    up: async (queryInterface, Sequelize) => {
        const now = new Date();

        await queryInterface.bulkInsert('notification_templates', [
            {
                id: uuidv4(),
                act: 'APPOINTMENT_CREATED',
                name: 'Appointment Created',
                subj: 'New Appointment Request from {{enrolleeName}} - {{appointmentDateTime}}',
                email_body: '<p>Dear {{providerName}},</p><p></p><p>A new appointment request has been submitted on AltuHealth.</p><p></p><p><strong>Appointment Details:</strong></p><ul><li><strong>Patient Name:</strong> {{enrolleeName}}</li><li><strong>Scheduled Date & Time:</strong> {{appointmentDateTime}}</li><li><strong>Complaint/Reason:</strong> {{complaint}}</li><li><strong>Additional Notes:</strong> {{notes}}</li></ul><p></p><p>Please log in to your AltuHealth provider portal to review and approve/reject this appointment request.</p><p></p><p><a href="{{providerPortalLink}}" target="_blank" rel="noopener noreferrer nofollow" style="display: inline-block; padding: 12px 24px; background-color: #007bff; color: white; text-decoration: none; border-radius: 4px; font-weight: bold;">Review Appointment</a></p><p></p><p><strong>Actions Required:</strong></p><ul><li>Review patient details and appointment reason</li><li>Check your availability for the requested date and time</li><li>Approve or reject the appointment</li><li>Provide feedback if rejecting</li></ul><p></p><p>If you have any questions, please contact our support team.</p><p></p><p>Best regards,<br>AltuHealth Team</p>',
                sms_body: 'New appointment request from {{enrolleeName}} on {{appointmentDateTime}}. Reason: {{complaint}}. Review at {{providerPortalLink}}',
                shortcodes: '{"enrolleeName": "Enrollee full name", "providerName": "Provider name", "appointmentDateTime": "Formatted appointment date and time", "complaint": "Patient complaint/reason for visit", "notes": "Additional notes from patient", "providerPortalLink": "Link to provider appointments dashboard"}',
                email_status: true,
                sms_status: false,
                created_at: now,
                updated_at: now
            }
        ], {});
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.bulkDelete('notification_templates', {
            act: 'APPOINTMENT_CREATED'
        }, {});
    }
};
