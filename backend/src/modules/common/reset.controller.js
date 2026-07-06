const bcrypt = require('bcrypt');
const notify = require('../../utils/notify');

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
    const policyModelKey = opts.policyModelKey || 'PolicyNumber';
    const userType = opts.userType || (typeof modelOrKey === 'string' ? modelOrKey : 'Admin');
    const templateName = opts.templateName || 'password-reset-success';

    return async (req, res, next) => {
        try {
            // only token and new password are required now
            const { token, password } = req.body || {};

            if (!token) return res.fail('Verification token is required', 400);
            if (!password) return res.fail('Password is required', 400);

            let UserModel = null;
            if (typeof modelOrKey === 'string') {
                UserModel = req.models && req.models[modelOrKey];
            } else {
                UserModel = modelOrKey;
            }
            if (!UserModel) return res.fail('Server configuration error (models missing)', 500);

            const { PasswordReset } = req.models || {};
            if (!PasswordReset) return res.fail('Server configuration error (PasswordReset model missing)', 500);

            // find the reset entry by token (we'll extract the userId from it)
            const resetEntry = await PasswordReset.findOne({ where: { token, isUsed: false } });
            if (!resetEntry) return res.fail('Invalid or used verification token', 401);

            // get the user id and user type from the reset entry
            const userId = resetEntry.userId;
            const userTypeFromReset = resetEntry.userType || userType;

            // Prefer a model keyed by the userType from the reset entry if available
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

            try {
                // notify using the userType from the reset entry when available
                // await notify(user, userTypeFromReset, templateName, null, 'email', true);
            } catch (e) {
                console.error('Failed to send password reset confirmation notification:', e && e.message ? e.message : e);
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
