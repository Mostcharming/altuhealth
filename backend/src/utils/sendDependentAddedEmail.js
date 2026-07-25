'use strict';

const config = require('../config');

function appendLoginPath(portalUrl) {
    if (!portalUrl) return '';

    const normalizedUrl = String(portalUrl).replace(/\/+$/, '');
    return normalizedUrl.endsWith('/login') ? normalizedUrl : `${normalizedUrl}/login`;
}

function buildDependentAddedNotification({
    dependent,
    enrollee,
    isRetailEnrollee = false,
    temporaryPassword = null
} = {}) {
    if (!dependent || !dependent.email) return null;

    const dependentName = [dependent.firstName, dependent.lastName].filter(Boolean).join(' ');
    const enrolleeName = [enrollee?.firstName, enrollee?.lastName].filter(Boolean).join(' ');
    const portalUrl = isRetailEnrollee
        ? config.retailDependentPortalUrl
        : config.enrolleeDependentPortalUrl;
    const loginLink = appendLoginPath(portalUrl);
    const hasTemporaryPassword = Boolean(temporaryPassword);

    const user = {
        id: dependent.id,
        email: dependent.email,
        firstName: dependent.firstName,
        lastName: dependent.lastName,
        policyNumber: dependent.policyNumber
    };

    if (hasTemporaryPassword) {
        return {
            user: {
                ...user,
                temporaryPassword,
                loginLink
            },
            userType: isRetailEnrollee
                ? 'retail_enrollee_dependent'
                : 'enrollee_dependent',
            templateName: isRetailEnrollee
                ? 'RETAIL_ENROLLEE_DEPENDENT_CREATED'
                : 'ENROLLEE_DEPENDENT_CREATED',
            shortCodes: {
                firstName: dependent.firstName,
                enrolleeFirstName: enrollee?.firstName || '',
                enrolleeLastName: enrollee?.lastName || '',
                policyNumber: dependent.policyNumber,
                temporaryPassword,
                loginLink
            },
            sendVia: ['email']
        };
    }

    return {
        user,
        userType: isRetailEnrollee
            ? 'retail_enrollee_dependent'
            : 'enrollee_dependent',
        templateName: 'DEPENDENT_ENROLLMENT',
        shortCodes: {
            dependentName,
            policyNumber: dependent.policyNumber,
            enrolleeName,
            dashboardLink: loginLink
        },
        sendVia: ['email']
    };
}

async function sendDependentAddedEmail(options, notifyFn = null) {
    const notification = buildDependentAddedNotification(options);
    if (!notification) return false;

    const sendNotification = notifyFn || require('./notify');
    await sendNotification(
        notification.user,
        notification.userType,
        notification.templateName,
        notification.shortCodes,
        notification.sendVia
    );

    return true;
}

module.exports = {
    appendLoginPath,
    buildDependentAddedNotification,
    sendDependentAddedEmail
};
