'use strict';
const { v4: uuidv4 } = require('uuid');

module.exports = {
    up: async (queryInterface, Sequelize) => {
        const now = new Date();

        await queryInterface.bulkInsert('notification_templates', [
            {
                id: uuidv4(),
                act: 'ENROLLEE_DEPENDENT_CREATED',
                name: 'Enrollee Dependent Account Creation',
                subj: 'Welcome to AltuHealth - Your Dependent Account Has Been Created',
                email_body: '<p>Dear {{firstName}},</p><p></p><p>Welcome to AltuHealth! Your dependent account has been successfully created by {{enrolleeFirstName}} {{enrolleeLastName}}.</p><p></p><p><strong>Your Login Details:</strong></p><p><strong>Policy Number:</strong> {{policyNumber}}</p><p><strong>Temporary Password:</strong> {{temporaryPassword}}</p><p></p><p><strong>Next Steps:</strong></p><ol><li>Click the link below to access the enrollee dependent portal</li><li>Log in with your policy number and temporary password</li><li>Update your password to something secure</li><li>View your dependent benefits and medical coverage</li><li>Update your profile information as needed</li></ol><p></p><p><a href="{{loginLink}}" target="_blank" rel="noopener noreferrer nofollow" style="display: inline-block; padding: 12px 24px; background-color: #007bff; color: white; text-decoration: none; border-radius: 4px; font-weight: bold;">Access Your Account</a></p><p></p><p><strong>Account Security:</strong></p><p>For your security, please:</p><ul><li>Never share your password with anyone</li><li>Change your temporary password immediately after first login</li><li>Use a strong, unique password</li></ul><p></p><p>If you have any questions or need assistance, please contact our support team.</p><p></p><p>Best regards,<br>AltuHealth Team</p>',
                sms_body: 'Welcome to AltuHealth! Your dependent account is ready. Policy: {{policyNumber}}, Temp Password: {{temporaryPassword}}. Log in at {{loginLink}} and change your password. Questions? Contact support.',
                shortcodes: '{"firstName": "Dependent first name", "enrolleeFirstName": "Enrollee first name", "enrolleeLastName": "Enrollee last name", "policyNumber": "Dependent policy number", "temporaryPassword": "Temporary password for login", "loginLink": "Link to dependent portal"}',
                email_status: true,
                sms_status: true,
                created_at: now,
                updated_at: now
            },
            {
                id: uuidv4(),
                act: 'RETAIL_ENROLLEE_DEPENDENT_CREATED',
                name: 'Retail Enrollee Dependent Account Creation',
                subj: 'Welcome to AltuHealth - Your Dependent Account Has Been Created',
                email_body: '<p>Dear {{firstName}},</p><p></p><p>Welcome to AltuHealth! Your dependent account has been successfully created by {{enrolleeFirstName}} {{enrolleeLastName}}.</p><p></p><p><strong>Your Login Details:</strong></p><p><strong>Policy Number:</strong> {{policyNumber}}</p><p><strong>Temporary Password:</strong> {{temporaryPassword}}</p><p></p><p><strong>Next Steps:</strong></p><ol><li>Click the link below to access the retail dependent portal</li><li>Log in with your policy number and temporary password</li><li>Update your password to something secure</li><li>View your retail dependent benefits and coverage details</li><li>Update your profile information as needed</li></ol><p></p><p><a href="{{loginLink}}" target="_blank" rel="noopener noreferrer nofollow" style="display: inline-block; padding: 12px 24px; background-color: #007bff; color: white; text-decoration: none; border-radius: 4px; font-weight: bold;">Access Your Account</a></p><p></p><p><strong>Account Security:</strong></p><p>For your security, please:</p><ul><li>Never share your password with anyone</li><li>Change your temporary password immediately after first login</li><li>Use a strong, unique password</li></ul><p></p><p>If you have any questions or need assistance, please contact our support team.</p><p></p><p>Best regards,<br>AltuHealth Team</p>',
                sms_body: 'Welcome to AltuHealth! Your retail dependent account is ready. Policy: {{policyNumber}}, Temp Password: {{temporaryPassword}}. Log in at {{loginLink}} and change your password. Questions? Contact support.',
                shortcodes: '{"firstName": "Dependent first name", "enrolleeFirstName": "Retail enrollee first name", "enrolleeLastName": "Retail enrollee last name", "policyNumber": "Dependent policy number", "temporaryPassword": "Temporary password for login", "loginLink": "Link to retail dependent portal"}',
                email_status: true,
                sms_status: true,
                created_at: now,
                updated_at: now
            }
        ], {});
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.bulkDelete('notification_templates', {
            act: ['ENROLLEE_DEPENDENT_CREATED', 'RETAIL_ENROLLEE_DEPENDENT_CREATED']
        }, {});
    }
};
