'use strict';
const { v4: uuidv4 } = require('uuid');

module.exports = {
    up: async (queryInterface, Sequelize) => {
        const now = new Date();

        await queryInterface.bulkInsert('notification_templates', [
            {
                id: uuidv4(),
                act: 'APPOINTMENT_APPROVED',
                name: 'Appointment Approved',
                subj: 'Your Appointment is Approved - {{providerName}} | {{appointmentDateTime}}',
                email_body: '<p>Dear {{enrolleeName}},</p><p></p><p>Great news! Your appointment request has been approved.</p><p></p><p><strong>Appointment Details:</strong></p><ul><li><strong>Provider:</strong> {{providerName}}</li><li><strong>Specialization:</strong> {{providerCategory}}</li><li><strong>Scheduled Date & Time:</strong> {{appointmentDateTime}}</li><li><strong>Location:</strong> {{providerAddress}}</li><li><strong>Contact:</strong> {{providerPhone}}</li></ul><p></p><p><strong>Important:</strong></p><ul><li>Please arrive 10 minutes before your scheduled time</li><li>Bring any required medical documents or insurance cards</li><li>If you cannot make it, please cancel or reschedule in advance</li></ul><p></p><p><a href="{{appointmentLink}}" target="_blank" rel="noopener noreferrer nofollow" style="display: inline-block; padding: 12px 24px; background-color: #28a745; color: white; text-decoration: none; border-radius: 4px; font-weight: bold;">View Appointment Details</a></p><p></p><p>If you have any questions, please contact {{providerPhone}} or reach out through the AltuHealth portal.</p><p></p><p>Best regards,<br>AltuHealth Team</p>',
                sms_body: 'Your appointment with {{providerName}} on {{appointmentDateTime}} has been approved! Location: {{providerAddress}}. View details: {{appointmentLink}}',
                shortcodes: '{"enrolleeName": "Enrollee full name", "providerName": "Provider name", "providerCategory": "Provider specialization/category", "appointmentDateTime": "Formatted appointment date and time", "providerAddress": "Provider address/location", "providerPhone": "Provider phone number", "appointmentLink": "Link to appointment details"}',
                email_status: true,
                sms_status: false,
                created_at: now,
                updated_at: now
            },
            {
                id: uuidv4(),
                act: 'APPOINTMENT_REJECTED',
                name: 'Appointment Rejected',
                subj: 'Your Appointment Request - {{providerName}}',
                email_body: '<p>Dear {{enrolleeName}},</p><p></p><p>Unfortunately, your appointment request with {{providerName}} could not be approved at this time.</p><p></p><p><strong>Appointment Details:</strong></p><ul><li><strong>Provider:</strong> {{providerName}}</li><li><strong>Requested Date & Time:</strong> {{appointmentDateTime}}</li><li><strong>Reason for Unavailability:</strong> {{rejectionReason}}</li></ul><p></p><p><strong>Next Steps:</strong></p><ul><li>You can request an appointment at a different date/time</li><li>Try scheduling with another provider in the same category</li><li>Contact the provider directly if you have further questions</li></ul><p></p><p><a href="{{appointmentLink}}" target="_blank" rel="noopener noreferrer nofollow" style="display: inline-block; padding: 12px 24px; background-color: #007bff; color: white; text-decoration: none; border-radius: 4px; font-weight: bold;">Request New Appointment</a></p><p></p><p>We apologize for any inconvenience. If you need assistance, please contact our support team.</p><p></p><p>Best regards,<br>AltuHealth Team</p>',
                sms_body: 'Your appointment request with {{providerName}} on {{appointmentDateTime}} could not be approved. Reason: {{rejectionReason}}. Book another at {{appointmentLink}}',
                shortcodes: '{"enrolleeName": "Enrollee full name", "providerName": "Provider name", "appointmentDateTime": "Formatted appointment date and time", "rejectionReason": "Reason provided by provider", "appointmentLink": "Link to book new appointment"}',
                email_status: true,
                sms_status: false,
                created_at: now,
                updated_at: now
            },
            {
                id: uuidv4(),
                act: 'APPOINTMENT_ATTENDED',
                name: 'Appointment Attended',
                subj: 'Appointment Completed - {{providerName}}',
                email_body: '<p>Dear {{enrolleeName}},</p><p></p><p>Thank you for visiting {{providerName}}. Your appointment has been marked as completed.</p><p></p><p><strong>Appointment Summary:</strong></p><ul><li><strong>Provider:</strong> {{providerName}}</li><li><strong>Date & Time:</strong> {{appointmentDateTime}}</li><li><strong>Status:</strong> Attended</li></ul><p></p><p><strong>What\'s Next:</strong></p><ul><li>Review your medical records in the AltuHealth portal</li><li>Check for any prescriptions or follow-up recommendations</li><li>Schedule a follow-up appointment if recommended by your provider</li><li>Leave feedback about your appointment experience</li></ul><p></p><p><a href="{{appointmentLink}}" target="_blank" rel="noopener noreferrer nofollow" style="display: inline-block; padding: 12px 24px; background-color: #007bff; color: white; text-decoration: none; border-radius: 4px; font-weight: bold;">View Medical Records</a></p><p></p><p>We appreciate your trust in AltuHealth for your healthcare needs.</p><p></p><p>Best regards,<br>AltuHealth Team</p>',
                sms_body: 'Your appointment with {{providerName}} on {{appointmentDateTime}} is complete. View your records and prescriptions: {{appointmentLink}}',
                shortcodes: '{"enrolleeName": "Enrollee full name", "providerName": "Provider name", "appointmentDateTime": "Formatted appointment date and time", "appointmentLink": "Link to medical records"}',
                email_status: true,
                sms_status: false,
                created_at: now,
                updated_at: now
            },
            {
                id: uuidv4(),
                act: 'APPOINTMENT_MISSED',
                name: 'Appointment Missed',
                subj: 'You Missed Your Appointment - {{providerName}}',
                email_body: '<p>Dear {{enrolleeName}},</p><p></p><p>You did not attend your scheduled appointment with {{providerName}}.</p><p></p><p><strong>Missed Appointment Details:</strong></p><ul><li><strong>Provider:</strong> {{providerName}}</li><li><strong>Scheduled Date & Time:</strong> {{appointmentDateTime}}</li><li><strong>Location:</strong> {{providerAddress}}</li></ul><p></p><p><strong>Important Information:</strong></p><ul><li>Missed appointments may affect your health and medical continuity</li><li>If you need to reschedule, please do so as soon as possible</li><li>Some providers may charge a cancellation fee for no-shows</li></ul><p></p><p><strong>Reschedule Your Appointment:</strong></p><p><a href="{{appointmentLink}}" target="_blank" rel="noopener noreferrer nofollow" style="display: inline-block; padding: 12px 24px; background-color: #ffc107; color: black; text-decoration: none; border-radius: 4px; font-weight: bold;">Reschedule Appointment</a></p><p></p><p>If you had an emergency or issue preventing you from attending, please contact {{providerPhone}} to discuss.</p><p></p><p>Best regards,<br>AltuHealth Team</p>',
                sms_body: 'You missed your appointment with {{providerName}} on {{appointmentDateTime}}. Reschedule now: {{appointmentLink}} or contact: {{providerPhone}}',
                shortcodes: '{"enrolleeName": "Enrollee full name", "providerName": "Provider name", "appointmentDateTime": "Formatted appointment date and time", "providerAddress": "Provider address/location", "providerPhone": "Provider phone number", "appointmentLink": "Link to reschedule appointment"}',
                email_status: true,
                sms_status: false,
                created_at: now,
                updated_at: now
            }
        ], {});
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.bulkDelete('notification_templates', {
            act: ['APPOINTMENT_APPROVED', 'APPOINTMENT_REJECTED', 'APPOINTMENT_ATTENDED', 'APPOINTMENT_MISSED']
        }, {});
    }
};
