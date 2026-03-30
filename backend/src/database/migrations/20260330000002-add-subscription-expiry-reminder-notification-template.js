'use strict';
const { v4: uuidv4 } = require('uuid');

module.exports = {
    up: async (queryInterface, Sequelize) => {
        const now = new Date();

        await queryInterface.bulkInsert('notification_templates', [
            {
                id: uuidv4(),
                act: 'SUBSCRIPTION_EXPIRY_REMINDER',
                name: 'Subscription Expiry Reminder',
                subj: 'Your AltuHealth Subscription is About to Expire',
                email_body: '<p>Dear {{name}},</p><p></p><p>This is a reminder that your subscription to your health plan on AltuHealth is about to expire.</p><p></p><p><strong>Your Subscription Details:</strong></p><p><strong>Policy Number:</strong> {{policyNumber}}</p><p><strong>Plan Name:</strong> {{planName}}</p><p><strong>Expiry Date:</strong> {{expiryDate}}</p><p></p><p>To avoid any interruption in your healthcare coverage, please log in to your AltuHealth dashboard and renew your payment as soon as possible.</p><p></p><p><a href="{{dashboardLink}}" target="_blank" rel="noopener noreferrer nofollow" style="display: inline-block; padding: 12px 24px; background-color: #007bff; color: white; text-decoration: none; border-radius: 4px; font-weight: bold;">Renew Subscription</a></p><p></p><p><strong>Why renew now?</strong></p><ul><li>Maintain uninterrupted access to your healthcare benefits</li><li>Continue coverage for yourself and your dependents</li><li>Avoid gaps in your medical history</li></ul><p></p><p>If you have any questions about your subscription or need assistance with renewal, please contact our support team.</p><p></p><p>Best regards,<br>AltuHealth Team</p>',
                sms_body: 'Reminder: Your AltuHealth subscription (Policy: {{policyNumber}}) expires on {{expiryDate}}. Renew now at {{dashboardLink}} to maintain coverage. Contact support if you need help.',
                shortcodes: '{"name": "Enrollee name", "policyNumber": "Policy number", "planName": "Plan name", "expiryDate": "Subscription expiry date", "dashboardLink": "Link to enrollee dashboard"}',
                email_status: true,
                sms_status: true,
                created_at: now,
                updated_at: now
            }
        ], {});
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.bulkDelete('notification_templates', {
            act: 'SUBSCRIPTION_EXPIRY_REMINDER'
        }, {});
    }
};
