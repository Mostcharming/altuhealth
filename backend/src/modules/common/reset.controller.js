const bcrypt = require('bcrypt');
const notify = require('../../utils/notify');

const makeResetPassword = (modelOrKey, opts = {}) => {
    const policyModelKey = opts.policyModelKey || 'PolicyNumber';
    const userType = opts.userType || (typeof modelOrKey === 'string' ? modelOrKey : 'Admin');
    const templateName = opts.templateName || 'password-reset-success';

    return async (req, res, next) => {
        try {
            const { email, policyNumber, token, password } = req.body || {};

            if (!token) return res.fail('Verification token is required', 400);
            if (!password) return res.fail('Password is required', 400);
            if (!email && !policyNumber) return res.fail('Provide email or policyNumber', 400);

            let UserModel = null;
            if (typeof modelOrKey === 'string') {
                UserModel = req.models && req.models[modelOrKey];
            } else {
                UserModel = modelOrKey;
            }
            if (!UserModel) return res.fail('Server configuration error (models missing)', 500);

            const { PasswordReset } = req.models || {};
            if (!PasswordReset) return res.fail('Server configuration error (PasswordReset model missing)', 500);

            let user = null;

            if (policyNumber) {
                const PolicyModel = req.models && req.models[policyModelKey];
                if (!PolicyModel) return res.fail('Server configuration error (Policy model missing)', 500);

                const lookupPolicyNumber = (typeof policyNumber === 'string') ? policyNumber.toUpperCase() : policyNumber;

                const policy = await PolicyModel.findOne({ where: { policyNumber: lookupPolicyNumber } });
                if (!policy || policy.userType !== userType) return res.fail('Invalid credentials', 401);

                user = await UserModel.findByPk(policy.userId);
            } else if (email) {
                user = await UserModel.findOne({ where: { email } });
            }

            if (!user) return res.fail('User not found', 404);

            const resetEntry = await PasswordReset.findOne({ where: { token, userId: user.id, userType, isUsed: false } });
            if (!resetEntry) return res.fail('Invalid or used verification token', 401);

            const saltRounds = 10;
            const passwordHash = await bcrypt.hash(password, saltRounds);

            try {
                if (user && typeof user.update === 'function') {
                    await user.update({ passwordHash });
                } else {
                    const { [typeof modelOrKey === 'string' ? modelOrKey : 'User']: UserModelFromReq } = req.models || {};
                    if (UserModelFromReq) await UserModelFromReq.update({ passwordHash }, { where: { id: user.id } });
                }

                await resetEntry.update({ isUsed: true });
            } catch (e) {
                console.error('Failed to update password or mark token used:', e && e.message ? e.message : e);
                return res.fail('Failed to reset password', 500);
            }

            try {
                await notify(user, templateName, null, 'email', true);
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
