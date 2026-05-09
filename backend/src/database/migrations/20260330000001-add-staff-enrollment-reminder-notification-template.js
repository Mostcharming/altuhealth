'use strict';
const { v4: uuidv4 } = require('uuid');

module.exports = {
    up: async (queryInterface, Sequelize) => {
        const now = new Date();

        await queryInterface.bulkInsert('notification_templates', [
            {
                id: uuidv4(),
                act: 'STAFF_ENROLLMENT_REMINDER',
                name: 'Staff Enrollment Reminder',
                subj: 'Reminder: Complete Your Enrollment on AltuHealth',
                email_body: '<p>Dear {{firstName}},</p><p></p><p>This is a reminder to complete your enrollment on the AltuHealth enrollee portal. You were added to <strong>{{companyName}}</strong> and need to activate your account to access benefits.</p><p></p><p><strong>Your Login Details:</strong></p><p><strong>Policy Number:</strong> {{policyNumber}}</p><p><strong>Temporary Password:</strong> {{temporaryPassword}}</p><p></p><p><strong>Next Steps:</strong></p><ol><li>Click the link below to access the enrollee portal</li><li>Log in with your policy number and temporary password</li><li>Update your password to something secure</li><li>View your available benefits</li><li>Add dependents if applicable</li></ol><p></p><p><a href="{{loginLink}}" target="_blank" rel="noopener noreferrer nofollow" style="display: inline-block; padding: 12px 24px; background-color: #007bff; color: white; text-decoration: none; border-radius: 4px; font-weight: bold;">Access Enrollee Portal</a></p><p></p><p>If you have any questions or need assistance, please contact our support team.</p><p></p><p>Best regards,<br>AltuHealth Team</p>',
                sms_body: 'Reminder: Complete your enrollment at {{loginLink}} using policy {{policyNumber}} and temp password {{temporaryPassword}}. Log in to view benefits and add dependents. Change your password after login.',
                shortcodes: '{"firstName": "Staff first name", "companyName": "Company name", "policyNumber": "Enrollee policy number", "temporaryPassword": "Temporary password for login", "loginLink": "Link to enrollee portal"}',
                email_status: true,
                sms_status: true,
                created_at: now,
                updated_at: now
            }
        ], {});
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.bulkDelete('notification_templates', {
            act: 'STAFF_ENROLLMENT_REMINDER'
        }, {});
    }
};
