const bcrypt = require('bcrypt');
const { Op } = require('sequelize');
const { addAdminNotification, addAuditLog } = require('../../../utils/addAdminNotification');
const {
    ACTIVE_STATUSES,
    findCurrentDeletionRequest,
    serializeDeletionRequest
} = require('../../../services/accountDeletionService');

function resolveAccountModel(req) {
    const accountType = req.user?.type;

    if (accountType === 'RetailEnrollee') {
        return req.models?.RetailEnrollee;
    }

    if (accountType === 'Enrollee') {
        return req.models?.Enrollee;
    }

    return null;
}

// Controller for enrollee account operations: update profile (excluding email) and change password
const updateProfile = () => async (req, res, next) => {
    try {
        const userId = req.user && req.user.id;
        if (!userId) return res.fail('Unauthorized', 401);

        const body = req.body || {};
        const allowed = [
            'firstName', 'lastName', 'phoneNumber',
            'state', 'country', 'currentLocation', 'latitude', 'longitude',
            'address', 'city', 'lga', 'postalCode'
        ];

        const updates = {};
        for (const key of allowed) {
            if (body[key] !== undefined) updates[key] = body[key];
        }

        // if a file was uploaded, prefer that for picture field
        if (req.profileImage && req.profileImage.filename) {
            // store absolute URL so the DB contains a route like http://host:port/upload/<filename>
            const base = (req.protocol && req.get && req.get('host')) ? `${req.protocol}://${req.get('host')}` : '';
            const rel = req.profileImage.url || `/upload/${req.profileImage.filename}`;
            updates.pictureUrl = base ? `${base}${rel}` : rel;
        }

        if (Object.keys(updates).length === 0) return res.fail('No updatable fields provided', 400);

        const AccountModel = resolveAccountModel(req);
        if (!AccountModel) return res.fail('Unsupported enrollee account type', 403);

        const user = await AccountModel.findByPk(userId);
        if (!user) return res.fail('Enrollee not found', 404);

        await user.update(updates);
        if (typeof user.reload === 'function') await user.reload();

        const safeUser = {
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            picture: user.pictureUrl || null,
            phoneNumber: user.phoneNumber || null,
            latitude: user.latitude || null,
            longitude: user.longitude || null,
            currentLocation: user.currentLocation || null,
            state: user.state || null,
            country: user.country || null,
            address: user.address || null,
            city: user.city || null,
            lga: user.lga || null,
            postalCode: user.postalCode || null,
            type: req.user.type,
            maxDependents: user.maxDependents ?? null,
            dependentVisitNotificationsEnabled: user.dependentVisitNotificationsEnabled
        };

        return res.success({ user: safeUser }, 'Profile updated');
    } catch (err) {
        return next(err);
    }
};

const changePassword = () => async (req, res, next) => {
    try {
        const userId = req.user && req.user.id;
        if (!userId) return res.fail('Unauthorized', 401);

        const { oldPassword, newPassword } = req.body || {};
        if (!oldPassword || !newPassword) return res.fail('oldPassword and newPassword are required', 400);
        if (typeof newPassword !== 'string' || newPassword.length < 8) return res.fail('Password must be at least 8 characters', 400);

        const AccountModel = resolveAccountModel(req);
        if (!AccountModel) return res.fail('Unsupported enrollee account type', 403);

        const user = await AccountModel.findByPk(userId);
        if (!user) return res.fail('Enrollee not found', 404);

        let matches = false;
        if (user.password) {
            try {
                matches = await bcrypt.compare(oldPassword, user.password);
            } catch (e) {
                // fallback to plain compare if bcrypt fails
                matches = user.password === oldPassword;
            }
        }

        if (!matches) return res.fail('Old password is incorrect', 401);

        const saltRounds = 10;
        const hashed = await bcrypt.hash(newPassword, saltRounds);
        await user.update({ password: hashed });

        return res.success(null, 'Password changed');
    } catch (err) {
        return next(err);
    }
};

const getProfile = () => async (req, res, next) => {
    try {
        const userId = req.user && req.user.id;
        if (!userId) return res.fail('Unauthorized', 401);

        const AccountModel = resolveAccountModel(req);
        if (!AccountModel) return res.fail('Unsupported enrollee account type', 403);

        const user = await AccountModel.findByPk(userId);
        if (!user) return res.fail('Enrollee not found', 404);

        const safeUser = {
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            picture: user.pictureUrl || null,
            phoneNumber: user.phoneNumber || null,
            latitude: user.latitude || null,
            longitude: user.longitude || null,
            currentLocation: user.currentLocation || null,
            state: user.state || null,
            country: user.country || null,
            address: user.address || null,
            city: user.city || null,
            lga: user.lga || null,
            postalCode: user.postalCode || null,
            type: req.user.type,
            maxDependents: user.maxDependents ?? null,
            dependentVisitNotificationsEnabled: user.dependentVisitNotificationsEnabled,
            requiresDependentVisitSetup: user.dependentVisitNotificationsEnabled === null
        };

        return res.success({ user: safeUser }, 'Profile fetched');
    } catch (err) {
        return next(err);
    }
};

const getDependentVisitPreference = () => async (req, res, next) => {
    try {
        const userId = req.user?.id;
        if (!userId) return res.fail('Unauthorized', 401);

        const AccountModel = resolveAccountModel(req);
        if (!AccountModel) return res.fail('Unsupported enrollee account type', 403);

        const user = await AccountModel.findByPk(userId, {
            attributes: ['id', 'dependentVisitNotificationsEnabled']
        });
        if (!user) return res.fail('Enrollee not found', 404);

        return res.success({
            dependentVisitNotificationsEnabled: user.dependentVisitNotificationsEnabled,
            requiresDependentVisitSetup: user.dependentVisitNotificationsEnabled === null
        }, 'Dependent visit preference fetched');
    } catch (err) {
        return next(err);
    }
};

const updateDependentVisitPreference = () => async (req, res, next) => {
    try {
        const userId = req.user?.id;
        if (!userId) return res.fail('Unauthorized', 401);

        const { enabled } = req.body || {};
        if (typeof enabled !== 'boolean') {
            return res.fail('`enabled` must be a boolean', 400);
        }

        const AccountModel = resolveAccountModel(req);
        if (!AccountModel) return res.fail('Unsupported enrollee account type', 403);

        const user = await AccountModel.findByPk(userId);
        if (!user) return res.fail('Enrollee not found', 404);

        await user.update({ dependentVisitNotificationsEnabled: enabled });

        return res.success({
            dependentVisitNotificationsEnabled: enabled,
            requiresDependentVisitSetup: false
        }, 'Dependent visit preference updated');
    } catch (err) {
        return next(err);
    }
};

const getDeletionRequest = () => async (req, res, next) => {
    try {
        const userId = req.user?.id;
        const userType = req.user?.type;
        if (!userId) return res.fail('Unauthorized', 401);
        if (!['Enrollee', 'RetailEnrollee'].includes(userType)) {
            return res.fail('Unsupported enrollee account type', 403);
        }

        const request = await findCurrentDeletionRequest(req.models, userId, userType);
        return res.success({ request: serializeDeletionRequest(request) }, 'Account deletion request fetched');
    } catch (err) {
        return next(err);
    }
};

const createDeletionRequest = () => async (req, res, next) => {
    try {
        const userId = req.user?.id;
        const userType = req.user?.type;
        const reason = typeof req.body?.reason === 'string' ? req.body.reason.trim() : '';
        if (!userId) return res.fail('Unauthorized', 401);
        if (!['Enrollee', 'RetailEnrollee'].includes(userType)) {
            return res.fail('Unsupported enrollee account type', 403);
        }
        if (reason.length < 10) return res.fail('Please provide a reason of at least 10 characters', 400);
        if (reason.length > 2000) return res.fail('Reason must not exceed 2000 characters', 400);

        const { AccountDeletionRequest } = req.models;
        const existing = await AccountDeletionRequest.findOne({
            where: { userId, userType, status: { [Op.in]: ACTIVE_STATUSES } },
            order: [['createdAt', 'DESC']]
        });
        if (existing) {
            return res.fail('An active account deletion request already exists', 409, {
                request: serializeDeletionRequest(existing)
            });
        }

        let request;
        try {
            request = await AccountDeletionRequest.create({ userId, userType, reason, status: 'pending' });
        } catch (error) {
            if (error?.name === 'SequelizeUniqueConstraintError') {
                return res.fail('An active account deletion request already exists', 409);
            }
            throw error;
        }

        await Promise.allSettled([
            addAdminNotification(req.models, {
                title: 'New enrollee account deletion request',
                clickUrl: '/account-deletion-requests'
            }),
            addAuditLog(req.models, {
                action: 'accountDeletion.requested',
                message: `Account deletion requested by ${userType} ${userId}`,
                userId,
                userType,
                meta: { requestId: request.id }
            })
        ]);

        return res.success({ request: serializeDeletionRequest(request) }, 'Account deletion request submitted', 201);
    } catch (err) {
        return next(err);
    }
};

const cancelDeletionRequest = () => async (req, res, next) => {
    try {
        const userId = req.user?.id;
        const userType = req.user?.type;
        if (!userId) return res.fail('Unauthorized', 401);

        const { AccountDeletionRequest } = req.models;
        const transaction = await AccountDeletionRequest.sequelize.transaction();
        let request;

        try {
            request = await AccountDeletionRequest.findOne({
                where: { userId, userType, status: { [Op.in]: ACTIVE_STATUSES } },
                order: [['createdAt', 'DESC']],
                transaction,
                lock: transaction.LOCK.UPDATE
            });
            if (!request) {
                await transaction.rollback();
                return res.fail('No cancellable account deletion request was found', 404);
            }
            if (request.status === 'approved' && new Date(request.retentionExpiresAt) <= new Date()) {
                await transaction.rollback();
                return res.fail('The 60-day cancellation window has ended', 409);
            }

            await request.update({ status: 'cancelled', cancelledAt: new Date() }, { transaction });
            await transaction.commit();
        } catch (error) {
            await transaction.rollback();
            throw error;
        }

        await addAuditLog(req.models, {
            action: 'accountDeletion.cancelled',
            message: `Account deletion request ${request.id} cancelled by enrollee`,
            userId,
            userType,
            meta: { requestId: request.id }
        }).catch(() => null);

        return res.success({ request: serializeDeletionRequest(request) }, 'Account deletion request cancelled');
    } catch (err) {
        return next(err);
    }
};

module.exports = {
    updateProfile: updateProfile(),
    changePassword: changePassword(),
    getProfile: getProfile(),
    getDependentVisitPreference: getDependentVisitPreference(),
    updateDependentVisitPreference: updateDependentVisitPreference(),
    getDeletionRequest: getDeletionRequest(),
    createDeletionRequest: createDeletionRequest(),
    cancelDeletionRequest: cancelDeletionRequest()
};
