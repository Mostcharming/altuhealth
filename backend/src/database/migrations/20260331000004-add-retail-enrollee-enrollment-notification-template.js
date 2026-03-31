'use strict';
const { v4: uuidv4 } = require('uuid');

module.exports = {
    up: async (queryInterface, Sequelize) => {
        const now = new Date();

        await queryInterface.bulkInsert('notification_templates', [
            {
                id: uuidv4(),
                act: 'RETAIL_ENROLLEE_ENROLLMENT',
                name: 'Retail Enrollee Enrollment',
                subj: 'Welcome to AltuHealth - Your Enrollment Details',
                email_body: '<p>Dear {{firstName}},</p><p></p><p>Welcome to AltuHealth! Your enrollment as a retail enrollee has been successfully created and activated.</p><p></p><p><strong>Your Login Details:</strong></p><p><strong>Policy Number:</strong> {{policyNumber}}</p><p><strong>Temporary Password:</strong> {{temporaryPassword}}</p><p></p><p><strong>Next Steps:</strong></p><ol><li>Click the link below to access the enrollee portal</li><li>Log in with your policy number and temporary password</li><li>Update your password to something secure</li><li>Review your coverage and benefits</li><li>Add dependents if applicable</li></ol><p></p><p><a href="{{loginLink}}" target="_blank" rel="noopener noreferrer nofollow" style="display: inline-block; padding: 12px 24px; background-color: #007bff; color: white; text-decoration: none; border-radius: 4px; font-weight: bold;">Access Enrollee Portal</a></p><p></p><p><strong>Plan Information:</strong></p><p>Plan: {{planName}}</p><p>Coverage Start: {{subscriptionStartDate}}</p><p></p><p>If you have any questions or need assistance, please contact our support team.</p><p></p><p>Best regards,<br>AltuHealth Team</p>',
                sms_body: 'Welcome to AltuHealth! Your enrollment is active. Log in at {{loginLink}} with policy {{policyNumber}} and temp password {{temporaryPassword}}. Change your password after login.',
                shortcodes: '{"firstName": "Retail enrollee first name", "policyNumber": "Enrollee policy number", "temporaryPassword": "Temporary password for login", "loginLink": "Link to enrollee portal", "planName": "Plan name", "subscriptionStartDate": "Coverage start date"}',
                email_status: true,
                sms_status: true,
                created_at: now,
                updated_at: now
            }
        ], {});
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.bulkDelete('notification_templates', {
            act: 'RETAIL_ENROLLEE_ENROLLMENT'
        }, {});
    }
};
