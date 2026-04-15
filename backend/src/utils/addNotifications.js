'use strict';

const config = require('../config');

/**
 * Create a provider notification record
 * @param {object} models - Sequelize models object
 * @param {object} opts
 * @param {string} opts.providerId - Provider ID (required)
 * @param {string} opts.title - Notification title (required)
 * @param {string|null} [opts.message=null] - Notification message
 * @param {string|null} [opts.clickUrl=null] - Optional URL to open when notification is clicked
 * @param {string|null} [opts.notificationType=null] - Type of notification
 * @returns {Promise<object>} created ProviderNotification instance
 */
async function addProviderNotification(models, { providerId, title, message = null, clickUrl = null, notificationType = null } = {}) {
    if (!models || !models.ProviderNotification) {
        throw new Error('models.ProviderNotification is required');
    }

    if (!providerId || typeof providerId !== 'string') {
        throw new Error('`providerId` is required and must be a string');
    }

    if (!title || typeof title !== 'string') {
        throw new Error('`title` is required and must be a string');
    }

    let resolvedClickUrl = null;
    if (clickUrl != null) {
        if (typeof clickUrl !== 'string') {
            throw new Error('`clickUrl` must be a string when provided');
        }

        const trimmed = clickUrl.trim();
        if (trimmed === '') {
            resolvedClickUrl = null;
        } else if (/^https?:\/\//i.test(trimmed)) {
            resolvedClickUrl = trimmed;
        } else {
            const fe = (config && config.feUrl) ? String(config.feUrl).replace(/\/+$/, '') : '';
            if (!fe) {
                resolvedClickUrl = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
            } else {
                if (trimmed.startsWith('/')) {
                    resolvedClickUrl = `${fe}${trimmed}`;
                } else {
                    resolvedClickUrl = `${fe}/${trimmed}`;
                }
            }
        }
    }

    const payload = {
        providerId,
        title: title.trim(),
        message: message ? message.trim() : null,
        clickUrl: resolvedClickUrl,
        notificationType: notificationType ? notificationType.trim() : null
    };

    const notif = await models.ProviderNotification.create(payload);
    return notif;
}

/**
 * Create an enrollee notification record
 * @param {object} models - Sequelize models object
 * @param {object} opts
 * @param {string} opts.enrolleeId - Enrollee ID (required)
 * @param {string} opts.title - Notification title (required)
 * @param {string|null} [opts.message=null] - Notification message
 * @param {string|null} [opts.clickUrl=null] - Optional URL to open when notification is clicked
 * @param {string|null} [opts.notificationType=null] - Type of notification
 * @returns {Promise<object>} created EnrolleeNotification instance
 */
async function addEnrolleeNotification(models, { enrolleeId, title, message = null, clickUrl = null, notificationType = null } = {}) {
    if (!models || !models.EnrolleeNotification) {
        throw new Error('models.EnrolleeNotification is required');
    }

    if (!enrolleeId || typeof enrolleeId !== 'string') {
        throw new Error('`enrolleeId` is required and must be a string');
    }

    if (!title || typeof title !== 'string') {
        throw new Error('`title` is required and must be a string');
    }

    let resolvedClickUrl = null;
    if (clickUrl != null) {
        if (typeof clickUrl !== 'string') {
            throw new Error('`clickUrl` must be a string when provided');
        }

        const trimmed = clickUrl.trim();
        if (trimmed === '') {
            resolvedClickUrl = null;
        } else if (/^https?:\/\//i.test(trimmed)) {
            resolvedClickUrl = trimmed;
        } else {
            const fe = (config && config.feUrl) ? String(config.feUrl).replace(/\/+$/, '') : '';
            if (!fe) {
                resolvedClickUrl = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
            } else {
                if (trimmed.startsWith('/')) {
                    resolvedClickUrl = `${fe}${trimmed}`;
                } else {
                    resolvedClickUrl = `${fe}/${trimmed}`;
                }
            }
        }
    }

    const payload = {
        enrolleeId,
        title: title.trim(),
        message: message ? message.trim() : null,
        clickUrl: resolvedClickUrl,
        notificationType: notificationType ? notificationType.trim() : null
    };

    const notif = await models.EnrolleeNotification.create(payload);
    return notif;
}

/**
 * Create an enrollee dependent notification record
 * @param {object} models - Sequelize models object
 * @param {object} opts
 * @param {string} opts.enrolleeDependentId - Enrollee Dependent ID (required)
 * @param {string} opts.title - Notification title (required)
 * @param {string|null} [opts.message=null] - Notification message
 * @param {string|null} [opts.clickUrl=null] - Optional URL to open when notification is clicked
 * @param {string|null} [opts.notificationType=null] - Type of notification
 * @returns {Promise<object>} created EnrolleeDependentNotification instance
 */
async function addEnrolleeDependentNotification(models, { enrolleeDependentId, title, message = null, clickUrl = null, notificationType = null } = {}) {
    if (!models || !models.EnrolleeDependentNotification) {
        throw new Error('models.EnrolleeDependentNotification is required');
    }

    if (!enrolleeDependentId || typeof enrolleeDependentId !== 'string') {
        throw new Error('`enrolleeDependentId` is required and must be a string');
    }

    if (!title || typeof title !== 'string') {
        throw new Error('`title` is required and must be a string');
    }

    let resolvedClickUrl = null;
    if (clickUrl != null) {
        if (typeof clickUrl !== 'string') {
            throw new Error('`clickUrl` must be a string when provided');
        }

        const trimmed = clickUrl.trim();
        if (trimmed === '') {
            resolvedClickUrl = null;
        } else if (/^https?:\/\//i.test(trimmed)) {
            resolvedClickUrl = trimmed;
        } else {
            const fe = (config && config.feUrl) ? String(config.feUrl).replace(/\/+$/, '') : '';
            if (!fe) {
                resolvedClickUrl = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
            } else {
                if (trimmed.startsWith('/')) {
                    resolvedClickUrl = `${fe}${trimmed}`;
                } else {
                    resolvedClickUrl = `${fe}/${trimmed}`;
                }
            }
        }
    }

    const payload = {
        enrolleeDependentId,
        title: title.trim(),
        message: message ? message.trim() : null,
        clickUrl: resolvedClickUrl,
        notificationType: notificationType ? notificationType.trim() : null
    };

    const notif = await models.EnrolleeDependentNotification.create(payload);
    return notif;
}

/**
 * Create a retail enrollee notification record
 * @param {object} models - Sequelize models object
 * @param {object} opts
 * @param {string} opts.retailEnrolleeId - Retail Enrollee ID (required)
 * @param {string} opts.title - Notification title (required)
 * @param {string|null} [opts.message=null] - Notification message
 * @param {string|null} [opts.clickUrl=null] - Optional URL to open when notification is clicked
 * @param {string|null} [opts.notificationType=null] - Type of notification
 * @returns {Promise<object>} created RetailEnrolleeNotification instance
 */
async function addRetailEnrolleeNotification(models, { retailEnrolleeId, title, message = null, clickUrl = null, notificationType = null } = {}) {
    if (!models || !models.RetailEnrolleeNotification) {
        throw new Error('models.RetailEnrolleeNotification is required');
    }

    if (!retailEnrolleeId || typeof retailEnrolleeId !== 'string') {
        throw new Error('`retailEnrolleeId` is required and must be a string');
    }

    if (!title || typeof title !== 'string') {
        throw new Error('`title` is required and must be a string');
    }

    let resolvedClickUrl = null;
    if (clickUrl != null) {
        if (typeof clickUrl !== 'string') {
            throw new Error('`clickUrl` must be a string when provided');
        }

        const trimmed = clickUrl.trim();
        if (trimmed === '') {
            resolvedClickUrl = null;
        } else if (/^https?:\/\//i.test(trimmed)) {
            resolvedClickUrl = trimmed;
        } else {
            const fe = (config && config.feUrl) ? String(config.feUrl).replace(/\/+$/, '') : '';
            if (!fe) {
                resolvedClickUrl = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
            } else {
                if (trimmed.startsWith('/')) {
                    resolvedClickUrl = `${fe}${trimmed}`;
                } else {
                    resolvedClickUrl = `${fe}/${trimmed}`;
                }
            }
        }
    }

    const payload = {
        retailEnrolleeId,
        title: title.trim(),
        message: message ? message.trim() : null,
        clickUrl: resolvedClickUrl,
        notificationType: notificationType ? notificationType.trim() : null
    };

    const notif = await models.RetailEnrolleeNotification.create(payload);
    return notif;
}

/**
 * Create a retail enrollee dependent notification record
 * @param {object} models - Sequelize models object
 * @param {object} opts
 * @param {string} opts.retailEnrolleeDependentId - Retail Enrollee Dependent ID (required)
 * @param {string} opts.title - Notification title (required)
 * @param {string|null} [opts.message=null] - Notification message
 * @param {string|null} [opts.clickUrl=null] - Optional URL to open when notification is clicked
 * @param {string|null} [opts.notificationType=null] - Type of notification
 * @returns {Promise<object>} created RetailEnrolleeDependentNotification instance
 */
async function addRetailEnrolleeDependentNotification(models, { retailEnrolleeDependentId, title, message = null, clickUrl = null, notificationType = null } = {}) {
    if (!models || !models.RetailEnrolleeDependentNotification) {
        throw new Error('models.RetailEnrolleeDependentNotification is required');
    }

    if (!retailEnrolleeDependentId || typeof retailEnrolleeDependentId !== 'string') {
        throw new Error('`retailEnrolleeDependentId` is required and must be a string');
    }

    if (!title || typeof title !== 'string') {
        throw new Error('`title` is required and must be a string');
    }

    let resolvedClickUrl = null;
    if (clickUrl != null) {
        if (typeof clickUrl !== 'string') {
            throw new Error('`clickUrl` must be a string when provided');
        }

        const trimmed = clickUrl.trim();
        if (trimmed === '') {
            resolvedClickUrl = null;
        } else if (/^https?:\/\//i.test(trimmed)) {
            resolvedClickUrl = trimmed;
        } else {
            const fe = (config && config.feUrl) ? String(config.feUrl).replace(/\/+$/, '') : '';
            if (!fe) {
                resolvedClickUrl = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
            } else {
                if (trimmed.startsWith('/')) {
                    resolvedClickUrl = `${fe}${trimmed}`;
                } else {
                    resolvedClickUrl = `${fe}/${trimmed}`;
                }
            }
        }
    }

    const payload = {
        retailEnrolleeDependentId,
        title: title.trim(),
        message: message ? message.trim() : null,
        clickUrl: resolvedClickUrl,
        notificationType: notificationType ? notificationType.trim() : null
    };

    const notif = await models.RetailEnrolleeDependentNotification.create(payload);
    return notif;
}

module.exports = {
    addProviderNotification,
    addEnrolleeNotification,
    addEnrolleeDependentNotification,
    addRetailEnrolleeNotification,
    addRetailEnrolleeDependentNotification
};
