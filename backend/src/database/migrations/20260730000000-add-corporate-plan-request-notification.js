'use strict';

const { v4: uuidv4 } = require('uuid');

module.exports = {
    async up(queryInterface) {
        const now = new Date();
        const existingTemplateId = await queryInterface.rawSelect(
            'notification_templates',
            { where: { act: 'CORPORATE_PLAN_REQUEST' } },
            'id'
        );
        const template = {
            name: 'Corporate Plan Request',
            subj: 'New corporate health plan request',
            email_body: [
                '<p>Hello {{firstName}},</p>',
                '<p>A new corporate health plan request has been submitted from the AltuHealth website.</p>',
                '<p><strong>Company:</strong> {{companyName}}</p>',
                '<p><strong>Contact person:</strong> {{contactName}}</p>',
                '<p><strong>Email:</strong> {{contactEmail}}</p>',
                '<p><strong>Phone:</strong> {{phoneNumber}}</p>',
                '<p><strong>Number of employees:</strong> {{employeeCount}}</p>',
                '<p><strong>Additional message:</strong><br>{{message}}</p>',
                '<p>Please contact the requester to discuss their corporate coverage needs.</p>'
            ].join(''),
            sms_body: null,
            shortcodes: JSON.stringify({
                companyName: 'Company name',
                contactName: 'Contact person name',
                contactEmail: 'Contact person email',
                phoneNumber: 'Contact phone number',
                employeeCount: 'Number of employees',
                message: 'Additional request information'
            }),
            email_status: true,
            sms_status: false,
            updated_at: now
        };

        if (existingTemplateId) {
            await queryInterface.bulkUpdate(
                'notification_templates',
                template,
                { act: 'CORPORATE_PLAN_REQUEST' }
            );
            return;
        }

        await queryInterface.bulkInsert('notification_templates', [{
            id: uuidv4(),
            act: 'CORPORATE_PLAN_REQUEST',
            ...template,
            created_at: now
        }]);
    },

    async down(queryInterface) {
        await queryInterface.bulkDelete(
            'notification_templates',
            { act: 'CORPORATE_PLAN_REQUEST' }
        );
    }
};
