'use strict';

const { hasDeletionAccessBlock } = require('../../services/accountDeletionService');

async function accountDeletionGuard(req, res, next) {
    try {
        const userId = req.user?.id;
        const userType = req.user?.type;
        if (!userId || !['Enrollee', 'RetailEnrollee'].includes(userType)) return next();

        const blocked = await hasDeletionAccessBlock(req.models, userId, userType);
        if (blocked) {
            return res.fail('This account has been archived and can no longer be accessed', 403, {
                code: 'ACCOUNT_ARCHIVED'
            });
        }

        return next();
    } catch (err) {
        return next(err);
    }
}

module.exports = accountDeletionGuard;
