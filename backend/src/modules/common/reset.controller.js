const bcrypt = require('bcrypt');
const { Op } = require('sequelize');

const getModelAttributes = (model) => {
    if (!model) return {};
    if (typeof model.getAttributes === 'function') return model.getAttributes();
    return model.rawAttributes || {};
};

const getPasswordField = (model) => {
    const attributes = getModelAttributes(model);
    if (attributes.passwordHash) return 'passwordHash';
    if (attributes.password) return 'password';
    return 'passwordHash';
};

const makeResetPassword = (modelOrKey, opts = {}) => {
    const userType = opts.userType || (typeof modelOrKey === 'string' ? modelOrKey : 'Admin');
    const allowedUserTypes = Array.isArray(opts.allowedUserTypes) ? opts.allowedUserTypes : null;
    const tokenMaxAgeMinutes = Number(opts.tokenMaxAgeMinutes) || null;
    const minimumPasswordLength = Number(opts.minimumPasswordLength) || 1;

    return async (req, res, next) => {
        try {
            const { token, password } = req.body || {};
            const normalizedToken = typeof token === 'string' ? token.trim() : token;

            if (!normalizedToken) return res.fail('Verification token is required', 400);
            if (!password) return res.fail('Password is required', 400);
            if (typeof password !== 'string' || password.length < minimumPasswordLength) {
                return res.fail(`Password must be at least ${minimumPasswordLength} characters long`, 400);
            }

            let UserModel = null;
            if (typeof modelOrKey === 'string') {
                UserModel = req.models && req.models[modelOrKey];
            } else {
                UserModel = modelOrKey;
            }
            if (!UserModel) return res.fail('Server configuration error (models missing)', 500);

            const { PasswordReset } = req.models || {};
            if (!PasswordReset) return res.fail('Server configuration error (PasswordReset model missing)', 500);

            const resetWhere = { token: normalizedToken, isUsed: false };
            if (tokenMaxAgeMinutes) {
                resetWhere.createdAt = {
                    [Op.gte]: new Date(Date.now() - tokenMaxAgeMinutes * 60 * 1000)
                };
            }

            const resetEntry = await PasswordReset.findOne({
                where: resetWhere,
                order: [['createdAt', 'DESC']]
            });
            if (!resetEntry) return res.fail('Invalid, expired, or used verification code', 401);

            const userId = resetEntry.userId;
            const userTypeFromReset = resetEntry.userType || userType;

            if (allowedUserTypes && !allowedUserTypes.includes(userTypeFromReset)) {
                return res.fail('Invalid, expired, or used verification code', 401);
            }

            if (req.models && req.models[userTypeFromReset]) {
                UserModel = req.models[userTypeFromReset];
            }

            if (!UserModel) return res.fail('Server configuration error (User model missing)', 500);

            const user = await UserModel.findByPk(userId);
            if (!user) return res.fail('User not found', 404);

            const saltRounds = 10;
            const passwordHash = await bcrypt.hash(password, saltRounds);
            const passwordField = getPasswordField(UserModel);

            try {
                if (user && typeof user.update === 'function') {
                    await user.update({ [passwordField]: passwordHash });
                } else {
                    await UserModel.update({ [passwordField]: passwordHash }, { where: { id: user.id } });
                }

                await resetEntry.update({ isUsed: true });
            } catch (e) {
                console.error('Failed to update password or mark token used:', e && e.message ? e.message : e);
                return res.fail('Failed to reset password', 500);
            }

            return res.success({}, 'Password has been reset');
        } catch (err) {
            return next(err);
        }
    };
};

module.exports = {
    makeResetPassword,
};
