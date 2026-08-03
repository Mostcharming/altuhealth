// Enrollee authentication controller
const Sequelize = require('sequelize');
const { enrolleeLogin } = require('./enrolleeLogin.controller');
const { makeResetPassword } = require('../../common/reset.controller');
const generateCode = require('../../../utils/verificationCode');
const notify = require('../../../utils/notify');

const RESET_CODE_TTL_MINUTES = 15;
const MAX_CODE_GENERATION_ATTEMPTS = 5;

const findByEmail = async (Model, email) => {
    const lookupEmail = (typeof email === 'string') ? email.trim().toLowerCase() : email;

    try {
        return await Model.findOne({
            where: Sequelize.where(Sequelize.fn('lower', Sequelize.col('email')), lookupEmail)
        });
    } catch (e) {
        return Model.findOne({ where: { email: lookupEmail } });
    }
};

const findEnrolleeForReset = async (req, { email, policyNumber }) => {
    const EnrolleeModel = req.models && req.models.Enrollee;
    const RetailEnrolleeModel = req.models && req.models.RetailEnrollee;
    if (!EnrolleeModel || !RetailEnrolleeModel) return null;

    const candidates = [
        { Model: EnrolleeModel, userType: 'Enrollee' },
        { Model: RetailEnrolleeModel, userType: 'RetailEnrollee' }
    ];

    for (const candidate of candidates) {
        let user = null;

        if (email) {
            user = await findByEmail(candidate.Model, email);
        } else if (policyNumber) {
            const lookupPolicyNumber = (typeof policyNumber === 'string') ? policyNumber.trim().toUpperCase() : policyNumber;
            user = await candidate.Model.findOne({ where: { policyNumber: lookupPolicyNumber } });
        }

        if (user) {
            return { user, userType: candidate.userType };
        }
    }

    return null;
};

const createPasswordReset = async (PasswordReset, userId, userType) => {
    await PasswordReset.update(
        { isUsed: true },
        { where: { userId, userType, isUsed: false } }
    );

    const activeSince = new Date(Date.now() - RESET_CODE_TTL_MINUTES * 60 * 1000);

    for (let attempt = 0; attempt < MAX_CODE_GENERATION_ATTEMPTS; attempt += 1) {
        const code = generateCode(6, { letters: false, numbers: true });
        const existingCode = await PasswordReset.findOne({
            where: {
                token: code,
                isUsed: false,
                createdAt: { [Sequelize.Op.gte]: activeSince }
            }
        });

        if (!existingCode) {
            const resetEntry = await PasswordReset.create({
                userId,
                userType,
                token: code
            });

            return { code, resetEntry };
        }
    }

    throw new Error('Unable to generate a unique password reset code');
};

const login = enrolleeLogin;
const forgot = async (req, res, next) => {
    try {
        const { email, policyNumber } = req.body || {};

        if (!email && !policyNumber) return res.fail('Provide email or policyNumber', 400);

        const { PasswordReset } = req.models || {};
        if (!PasswordReset) return res.fail('Server configuration error (PasswordReset model missing)', 500);
        if (!req.models.Enrollee || !req.models.RetailEnrollee) {
            return res.fail('Server configuration error (models missing)', 500);
        }

        const result = await findEnrolleeForReset(req, { email, policyNumber });
        if (!result) return res.fail('Invalid credentials', 401);

        const { code, resetEntry } = await createPasswordReset(
            PasswordReset,
            result.user.id,
            result.userType
        );

        try {
            const deliveryResults = await notify(
                result.user,
                result.userType,
                'OTP',
                { code },
                ['email'],
                true
            );

            if (!deliveryResults || deliveryResults.email !== true) {
                throw new Error('Password reset email was not delivered');
            }
        } catch (e) {
            console.error('Failed to send password reset notification:', e && e.message ? e.message : e);

            try {
                await resetEntry.destroy();
            } catch (cleanupError) {
                console.error(
                    'Failed to remove undelivered password reset code:',
                    cleanupError && cleanupError.message ? cleanupError.message : cleanupError
                );
            }

            return res.fail('Unable to send verification code. Please try again.', 502);
        }

        return res.success({}, 'Verification code sent');
    } catch (err) {
        return next(err);
    }
};
const reset = makeResetPassword('Enrollee', {
    userType: 'Enrollee',
    allowedUserTypes: ['Enrollee', 'RetailEnrollee'],
    tokenMaxAgeMinutes: RESET_CODE_TTL_MINUTES,
    minimumPasswordLength: 8,
});

module.exports = {
    login,
    forgot,
    reset,
};
