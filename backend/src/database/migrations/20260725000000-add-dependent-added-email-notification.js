'use strict';

const { v4: uuidv4 } = require('uuid');

const subject = 'Welcome to AltuHealth - You Have Been Added as a Dependent';

const enrollmentBody = [
    '<p>Dear {{dependentName}},</p>',
    '<p>{{enrolleeName}} has added you as a dependent on AltuHealth.</p>',
    '<p>Your health coverage is now active, and you can start enjoying the benefits available under the primary enrollee&#39;s plan.</p>',
    '<p><strong>Your policy number:</strong> {{policyNumber}}</p>',
    '<p>Please keep your policy number handy when accessing healthcare services.</p>',
    '<p>If you have any questions about your benefits or need assistance, please contact our support team.</p>',
    '<p>Best regards,<br>AltuHealth Team</p>'
].join('');

const accountBody = [
    '<p>Dear {{firstName}},</p>',
    '<p>{{enrolleeFirstName}} {{enrolleeLastName}} has added you as a dependent on AltuHealth.</p>',
    '<p>Your health coverage is now active, and you can start enjoying the benefits available under the primary enrollee&#39;s plan.</p>',
    '<p><strong>Your Login Details:</strong></p>',
    '<p><strong>Policy Number:</strong> {{policyNumber}}<br><strong>Temporary Password:</strong> {{temporaryPassword}}</p>',
    '<p><strong>Next Steps:</strong></p>',
    '<ol><li>Access the dependent portal using the link below</li><li>Log in with your policy number and temporary password</li><li>Change your temporary password</li><li>View your available benefits and coverage</li></ol>',
    '<p><a href="{{loginLink}}" target="_blank" rel="noopener noreferrer nofollow" style="display: inline-block; padding: 12px 24px; background-color: #007bff; color: white; text-decoration: none; border-radius: 4px; font-weight: bold;">Access Your Account</a></p>',
    '<p>If you have any questions about your benefits or need assistance, please contact our support team.</p>',
    '<p>Best regards,<br>AltuHealth Team</p>'
].join('');

const previousAccountBodies = {
    ENROLLEE_DEPENDENT_CREATED: '<p>Dear {{firstName}},</p><p></p><p>Welcome to AltuHealth! Your dependent account has been successfully created by {{enrolleeFirstName}} {{enrolleeLastName}}.</p><p></p><p><strong>Your Login Details:</strong></p><p><strong>Policy Number:</strong> {{policyNumber}}</p><p><strong>Temporary Password:</strong> {{temporaryPassword}}</p><p></p><p><strong>Next Steps:</strong></p><ol><li>Click the link below to access the enrollee dependent portal</li><li>Log in with your policy number and temporary password</li><li>Update your password to something secure</li><li>View your dependent benefits and medical coverage</li><li>Update your profile information as needed</li></ol><p></p><p><a href="{{loginLink}}" target="_blank" rel="noopener noreferrer nofollow" style="display: inline-block; padding: 12px 24px; background-color: #007bff; color: white; text-decoration: none; border-radius: 4px; font-weight: bold;">Access Your Account</a></p><p></p><p><strong>Account Security:</strong></p><p>For your security, please:</p><ul><li>Never share your password with anyone</li><li>Change your temporary password immediately after first login</li><li>Use a strong, unique password</li></ul><p></p><p>If you have any questions or need assistance, please contact our support team.</p><p></p><p>Best regards,<br>AltuHealth Team</p>',
    RETAIL_ENROLLEE_DEPENDENT_CREATED: '<p>Dear {{firstName}},</p><p></p><p>Welcome to AltuHealth! Your dependent account has been successfully created by {{enrolleeFirstName}} {{enrolleeLastName}}.</p><p></p><p><strong>Your Login Details:</strong></p><p><strong>Policy Number:</strong> {{policyNumber}}</p><p><strong>Temporary Password:</strong> {{temporaryPassword}}</p><p></p><p><strong>Next Steps:</strong></p><ol><li>Click the link below to access the retail dependent portal</li><li>Log in with your policy number and temporary password</li><li>Update your password to something secure</li><li>View your retail dependent benefits and coverage details</li><li>Update your profile information as needed</li></ol><p></p><p><a href="{{loginLink}}" target="_blank" rel="noopener noreferrer nofollow" style="display: inline-block; padding: 12px 24px; background-color: #007bff; color: white; text-decoration: none; border-radius: 4px; font-weight: bold;">Access Your Account</a></p><p></p><p><strong>Account Security:</strong></p><p>For your security, please:</p><ul><li>Never share your password with anyone</li><li>Change your temporary password immediately after first login</li><li>Use a strong, unique password</li></ul><p></p><p>If you have any questions or need assistance, please contact our support team.</p><p></p><p>Best regards,<br>AltuHealth Team</p>'
};

module.exports = {
    async up(queryInterface) {
        const now = new Date();
        const existingEnrollmentTemplateId = await queryInterface.rawSelect(
            'notification_templates',
            { where: { act: 'DEPENDENT_ENROLLMENT' } },
            'id'
        );

        const enrollmentTemplate = {
            name: 'Dependent Added Confirmation',
            subj: subject,
            email_body: enrollmentBody,
            sms_body: 'Welcome to AltuHealth! {{enrolleeName}} added you as a dependent. Your coverage is active and you can start enjoying your benefits. Policy: {{policyNumber}}.',
            shortcodes: JSON.stringify({
                dependentName: 'Dependent full name',
                policyNumber: 'Dependent policy number',
                enrolleeName: 'Primary enrollee name'
            }),
            email_status: true,
            sms_status: true,
            updated_at: now
        };

        if (existingEnrollmentTemplateId) {
            await queryInterface.bulkUpdate(
                'notification_templates',
                enrollmentTemplate,
                { act: 'DEPENDENT_ENROLLMENT' }
            );
        } else {
            await queryInterface.bulkInsert('notification_templates', [{
                id: uuidv4(),
                act: 'DEPENDENT_ENROLLMENT',
                ...enrollmentTemplate,
                created_at: now
            }]);
        }

        await queryInterface.bulkUpdate(
            'notification_templates',
            {
                subj: subject,
                email_body: accountBody,
                updated_at: now
            },
            {
                act: [
                    'ENROLLEE_DEPENDENT_CREATED',
                    'RETAIL_ENROLLEE_DEPENDENT_CREATED'
                ]
            }
        );
    },

    async down(queryInterface) {
        const now = new Date();

        await queryInterface.bulkDelete(
            'notification_templates',
            { act: 'DEPENDENT_ENROLLMENT' }
        );

        for (const [act, emailBody] of Object.entries(previousAccountBodies)) {
            await queryInterface.bulkUpdate(
                'notification_templates',
                {
                    subj: 'Welcome to AltuHealth - Your Dependent Account Has Been Created',
                    email_body: emailBody,
                    updated_at: now
                },
                { act }
            );
        }
    }
};
