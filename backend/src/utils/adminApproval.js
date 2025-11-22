'use strict';

const { addAdminNotification } = require('./addAdminNotification');

/**
 * Create an admin approval record and a related admin notification.
 * Can be used as a plain helper or wrapped as Express middleware.
 *
 * createAdminApproval(models, opts)
 * - models: Sequelize models object (required)
 * - opts: { model, modelId, action = 'other', details = null, requestedBy, requestedByType = 'Admin', comments = null, meta = null, dueAt = null }
 */
async function createAdminApproval(models, opts = {}) {
    if (!models || !models.AdminApproval) {
        throw new Error('models.AdminApproval is required');
    }

    const {
        model,
        modelId,
        action = 'other',
        details = null,
        requestedBy,
        requestedByType = 'Admin',
        comments = null,
        meta = null,
        dueAt = null
    } = opts || {};

    if (!model || typeof model !== 'string') {
        throw new Error('`model` is required and must be a string');
    }
    if (!modelId) {
        throw new Error('`modelId` is required');
    }
    if (!requestedBy) {
        throw new Error('`requestedBy` is required');
    }

    const payload = {
        model: model.trim(),
        modelId,
        action,
        details,
        requestedBy,
        requestedByType,
        comments,
        meta,
        dueAt
    };

    const adminApproval = await models.AdminApproval.create(payload);

    // create an admin notification with clickUrl set to 'approval' as requested
    try {
        const title = `Approval requested: ${payload.model}`;
        // addAdminNotification will resolve relative clickUrl against the configured FE URL
        await addAdminNotification(models, { title, clickUrl: 'approval' });
    } catch (err) {
        // Don't fail the main operation if notification creation fails, but surface a warning in logs if available
        if (console && console.warn) console.warn('Failed to create admin notification for approval:', err.message || err);
    }

    return adminApproval;
}

/**
 * Express middleware factory.
 *
 * Usage:
 *  - Provide a static opts object: router.post('/x', adminApprovalMiddleware({ model: 'User', modelId: '...', requestedBy: req.user.id }), handler)
 *  - Provide a function that returns opts from the request: adminApprovalMiddleware(req => ({ model: 'User', modelId: req.params.id, requestedBy: req.user.id }))
 *
 * The created approval will be attached to `req.adminApproval`.
 */
function adminApprovalMiddleware(optsOrGetter) {
    return async function (req, res, next) {
        try {
            // try to resolve models from common places on the request/app
            const models = req.models || (req.app && req.app.get && req.app.get('models')) || (res.locals && res.locals.models) || (req.context && req.context.models);
            if (!models) throw new Error('Sequelize models not available on request. Attach models to `req.models` or `req.app.get("models")`.');

            const opts = (typeof optsOrGetter === 'function') ? await optsOrGetter(req) : optsOrGetter;
            if (!opts) throw new Error('No options provided to adminApprovalMiddleware');

            const approval = await createAdminApproval(models, opts);
            req.adminApproval = approval;
            return next();
        } catch (err) {
            return next(err);
        }
    };
}

module.exports = {
    createAdminApproval,
    adminApprovalMiddleware
};
