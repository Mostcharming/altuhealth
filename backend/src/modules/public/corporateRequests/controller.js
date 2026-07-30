'use strict';

const notify = require('../../../utils/notify');

const MAX_LENGTHS = {
    companyName: 150,
    contactName: 120,
    email: 254,
    phoneNumber: 30,
    message: 2000
};

function normalizeText(value) {
    return String(value || '').trim().replace(/\s+/g, ' ');
}

function escapeHtml(value) {
    return String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

function validateLength(field, value) {
    return value.length <= MAX_LENGTHS[field];
}

async function submitCorporateRequest(req, res, next) {
    try {
        const { Admin, NotificationTemplate } = req.models;
        const companyName = normalizeText(req.body?.companyName);
        const contactName = normalizeText(req.body?.contactName);
        const email = normalizeText(req.body?.email).toLowerCase();
        const phoneNumber = normalizeText(req.body?.phoneNumber);
        const message = normalizeText(req.body?.message);
        const employeeCount = req.body?.employeeCount === undefined
            || req.body?.employeeCount === null
            || req.body?.employeeCount === ''
            ? null
            : Number(req.body.employeeCount);

        if (!companyName || !contactName || !email || !phoneNumber) {
            return res.fail(
                'Company name, contact person, work email, and phone number are required',
                400
            );
        }

        const fieldsToValidate = { companyName, contactName, email, phoneNumber, message };
        const invalidLength = Object.entries(fieldsToValidate)
            .find(([field, value]) => !validateLength(field, value));
        if (invalidLength) {
            return res.fail(`${invalidLength[0]} is too long`, 400);
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            return res.fail('Enter a valid work email address', 400);
        }

        if (employeeCount !== null && (
            !Number.isInteger(employeeCount)
            || employeeCount < 1
            || employeeCount > 1000000
        )) {
            return res.fail('Number of employees must be between 1 and 1,000,000', 400);
        }

        const template = await NotificationTemplate.findOne({
            where: { act: 'CORPORATE_PLAN_REQUEST', emailStatus: true }
        });
        if (!template) {
            return res.fail('Corporate requests are temporarily unavailable', 503);
        }

        const admins = await Admin.findAll({
            where: {
                status: 'active',
                isDeleted: false
            },
            attributes: ['id', 'firstName', 'lastName', 'email']
        });

        if (admins.length === 0) {
            return res.fail('Corporate requests are temporarily unavailable', 503);
        }

        const shortCodes = {
            companyName: escapeHtml(companyName),
            contactName: escapeHtml(contactName),
            contactEmail: escapeHtml(email),
            phoneNumber: escapeHtml(phoneNumber),
            employeeCount: employeeCount === null
                ? 'Not provided'
                : employeeCount.toLocaleString('en-NG'),
            message: message ? escapeHtml(message) : 'No additional message provided.'
        };

        await Promise.all(admins.map((admin) => notify(
            admin,
            'Admin',
            'CORPORATE_PLAN_REQUEST',
            shortCodes,
            ['email'],
            true
        )));

        return res.success(
            null,
            'Request submitted. Our corporate team will contact you shortly.',
            201
        );
    } catch (err) {
        return next(err);
    }
}

module.exports = {
    submitCorporateRequest
};
