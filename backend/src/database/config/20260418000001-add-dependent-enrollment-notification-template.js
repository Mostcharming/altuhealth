'use strict';
const { v4: uuidv4 } = require('uuid');

module.exports = {
    up: async (queryInterface, Sequelize) => {
        const now = new Date();

        await queryInterface.bulkInsert('notification_templates', [
            {
                id: uuidv4(),
                act: 'DEPENDENT_ENROLLMENT',
                name: 'Dependent Enrollment Confirmation',
                subj: 'Welcome to AltuHealth - Dependent Enrollment Confirmation',
                email_body: '<p>Dear {{dependentName}},</p><p></p><p>Congratulations! You have been successfully enrolled as a dependent on AltuHealth.</p><p></p><p><strong>Your Enrollment Details:</strong></p><p><strong>Name:</strong> {{dependentName}}</p><p><strong>Policy Number:</strong> {{policyNumber}}</p><p><strong>Primary Enrollee:</strong> {{enrolleeName}}</p><p></p><p>As an enrolled dependent, you now have access to:</p><ul><li>Comprehensive health coverage through our partner providers</li><li>Access to the AltuHealth mobile app and web platform</li><li>Convenient appointment booking with healthcare providers</li><li>Digital health records and prescription management</li><li>24/7 customer support</li></ul><p></p><p><strong>Next Steps:</strong></p><ol><li>Download the AltuHealth app or visit our website</li><li>Use your policy number ({{policyNumber}}) to access your account</li><li>Complete your health profile for better service</li><li>Browse and connect with available healthcare providers</li></ol><p></p><p><a href="{{dashboardLink}}" target="_blank" rel="noopener noreferrer nofollow" style="display: inline-block; padding: 12px 24px; background-color: #007bff; color: white; text-decoration: none; border-radius: 4px; font-weight: bold;">Access Your Account</a></p><p></p><p>If you have any questions about your enrollment or need assistance, please don\'t hesitate to contact our support team. We\'re here to help!</p><p></p><p>Best regards,<br>AltuHealth Team</p>',
                sms_body: 'Welcome to AltuHealth! You\'ve been enrolled as a dependent. Policy: {{policyNumber}}. Access your account at {{dashboardLink}}. Contact support for questions.',
                shortcodes: '{"dependentName": "Dependent full name", "policyNumber": "Dependent policy number", "enrolleeName": "Primary enrollee name", "dashboardLink": "Link to enrollee dashboard"}',
                email_status: true,
                sms_status: true,
                created_at: now,
                updated_at: now
            }
        ], {});
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.bulkDelete('notification_templates', {
            act: 'DEPENDENT_ENROLLMENT'
        }, {});
    }
};
