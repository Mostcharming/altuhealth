'use strict';
const { v4: uuidv4 } = require('uuid');

module.exports = {
    up: async (queryInterface, Sequelize) => {
        const now = new Date();

        await queryInterface.bulkInsert('notification_templates', [
            {
                id: uuidv4(),
                act: 'COMPANY_SUBSCRIPTION_EXPIRY_REMINDER',
                name: 'Company Subscription Expiry Reminder',
                subj: 'Your AltuHealth Company Subscription is About to Expire',
                email_body: '<p>Dear {{companyName}},</p><p></p><p>This is a reminder that your company subscription to AltuHealth is about to expire.</p><p></p><p><strong>Your Subscription Details:</strong></p><p><strong>Company Name:</strong> {{companyName}}</p><p><strong>Subscription ID:</strong> {{subscriptionId}}</p><p><strong>Plan Type:</strong> {{planType}}</p><p><strong>Number of Employees:</strong> {{employeeCount}}</p><p><strong>Expiry Date:</strong> {{expiryDate}}</p><p></p><p>To ensure uninterrupted healthcare coverage for your employees, please log in to your AltuHealth admin dashboard and renew your subscription as soon as possible.</p><p></p><p><a href="{{dashboardLink}}" target="_blank" rel="noopener noreferrer nofollow" style="display: inline-block; padding: 12px 24px; background-color: #007bff; color: white; text-decoration: none; border-radius: 4px; font-weight: bold;">Renew Company Subscription</a></p><p></p><p><strong>Why renew now?</strong></p><ul><li>Maintain continuous healthcare benefits for all employees</li><li>Avoid coverage gaps that could impact your workforce</li><li>Ensure compliance with employee benefits obligations</li><li>Retain all employee health records and history</li></ul><p></p><p>If you have any questions about your company subscription or need assistance with renewal, please contact our corporate support team.</p><p></p><p>Best regards,<br>AltuHealth Team</p>',
                sms_body: 'Reminder: Your AltuHealth company subscription expires on {{expiryDate}}. Renew now at {{dashboardLink}} to maintain employee coverage. Contact corporate support for assistance.',
                shortcodes: '{"companyName": "Company name", "subscriptionId": "Company subscription ID", "planType": "Plan type/tier", "employeeCount": "Number of enrolled employees", "expiryDate": "Subscription expiry date", "dashboardLink": "Link to company admin dashboard"}',
                email_status: true,
                sms_status: true,
                created_at: now,
                updated_at: now
            }
        ], {});
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.bulkDelete('notification_templates', {
            act: 'COMPANY_SUBSCRIPTION_EXPIRY_REMINDER'
        }, {});
    }
};
