
/**
 * Utility to create an AdminNotification record.
 * Can be called from anywhere by passing the models object (e.g. req.models).
 *
 * Usage:
 * const addAdminNotification = require('../utils/addAdminNotification');
 * await addAdminNotification(models, {  title, clickUrl });
 *
 */

async function addAdminNotification(models, { title, clickUrl = null } = {}) {
    if (!models || !models.AdminNotification) {
        throw new Error('models.AdminNotification is required');
    }

    if (!title) {
        throw new Error('`title` is required');
    }

    const payload = {
        title,
        clickUrl
    };

    const notif = await models.AdminNotification.create(payload);
    return notif;
}

// convenience wrapper when you have an express `req` object
async function addAdminNotificationFromReq(req, data) {
    if (!req || !req.models) throw new Error('`req.models` is required');
    return addAdminNotification(req.models, data);
}

module.exports = addAdminNotification;
module.exports.fromReq = addAdminNotificationFromReq;
