'use strict';

const bcrypt = require('bcrypt');
const { Op, fn, col, where } = require('sequelize');

const MIN_PASSWORD_LENGTH = 8;
const MAX_BCRYPT_PASSWORD_BYTES = 72;
const MAX_NAME_LENGTH = 100;
const MAX_EMAIL_LENGTH = 254;

const toNumber = (value) => {
    const parsed = Number.parseFloat(value || 0);
    return Number.isFinite(parsed) ? parsed : 0;
};

const toSafeReferrer = (referrer) => ({
    id: referrer.id,
    firstName: referrer.firstName,
    lastName: referrer.lastName,
    email: referrer.email || null,
    phoneNumber: referrer.phoneNumber,
    referralCode: referrer.referralCode,
    status: referrer.status,
    bankName: referrer.bankName || null,
    accountName: referrer.accountName || null,
    accountNumber: referrer.accountNumber || null,
    totalEarning: toNumber(referrer.totalEarning),
    availableBalance: toNumber(referrer.availableBalance),
    totalWithdrawn: toNumber(referrer.totalWithdrawn),
    picture: referrer.picture || null,
    createdAt: referrer.createdAt || null,
    updatedAt: referrer.updatedAt || null,
    type: 'Referrer'
});

const getAuthenticatedReferrer = async (req, res) => {
    const userId = req.user && req.user.id;

    if (!userId) {
        res.fail('Unauthorized', 401);
        return null;
    }

    if (req.user.type !== 'Referrer') {
        res.fail('Referrer authentication required', 403);
        return null;
    }

    const Referrer = req.models && req.models.Referrer;
    if (!Referrer) {
        res.fail('Server configuration error (Referrer model missing)', 500);
        return null;
    }

    const referrer = await Referrer.findOne({
        where: {
            id: userId,
            isDeleted: false
        }
    });

    if (!referrer) {
        res.fail('Referrer not found', 404);
        return null;
    }

    if (referrer.status !== 'active') {
        res.fail('Account is not active', 403);
        return null;
    }

    return referrer;
};

const normalizeName = (value, fieldName) => {
    if (typeof value !== 'string') {
        return { error: `${fieldName} must be a string` };
    }

    const normalized = value.trim().replace(/\s+/g, ' ');
    if (!normalized) {
        return { error: `${fieldName} is required` };
    }
    if (normalized.length > MAX_NAME_LENGTH) {
        return { error: `${fieldName} must not exceed ${MAX_NAME_LENGTH} characters` };
    }

    return { value: normalized };
};

const normalizeEmail = (value) => {
    if (value === null) return { value: null };
    if (typeof value !== 'string') {
        return { error: 'email must be a string' };
    }

    const normalized = value.trim().toLowerCase();
    if (!normalized) return { value: null };
    if (normalized.length > MAX_EMAIL_LENGTH || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized)) {
        return { error: 'Provide a valid email address' };
    }

    return { value: normalized };
};

const normalizePhoneNumber = (value) => {
    if (typeof value !== 'string') {
        return { error: 'phoneNumber must be a string' };
    }

    const normalized = value.trim().replace(/[\s().-]/g, '');
    if (!/^\+?\d{7,15}$/.test(normalized)) {
        return { error: 'Provide a valid phone number containing 7 to 15 digits' };
    }

    return { value: normalized };
};

const uploadedPictureUrl = (req) => {
    if (!req.profileImage || !req.profileImage.filename) return null;

    const baseUrl = req.protocol && req.get && req.get('host')
        ? `${req.protocol}://${req.get('host')}`
        : '';
    const relativeUrl = req.profileImage.url || `/upload/${req.profileImage.filename}`;

    return baseUrl ? `${baseUrl}${relativeUrl}` : relativeUrl;
};

const getProfile = async (req, res, next) => {
    try {
        const referrer = await getAuthenticatedReferrer(req, res);
        if (!referrer) return;

        return res.success({ user: toSafeReferrer(referrer) }, 'Profile fetched successfully');
    } catch (error) {
        return next(error);
    }
};

const updateProfile = async (req, res, next) => {
    try {
        const referrer = await getAuthenticatedReferrer(req, res);
        if (!referrer) return;

        const body = req.body || {};
        const updates = {};

        for (const fieldName of ['firstName', 'lastName']) {
            if (body[fieldName] !== undefined) {
                const result = normalizeName(body[fieldName], fieldName);
                if (result.error) return res.fail(result.error, 400);
                updates[fieldName] = result.value;
            }
        }

        if (body.email !== undefined) {
            const result = normalizeEmail(body.email);
            if (result.error) return res.fail(result.error, 400);
            updates.email = result.value;
        }

        if (body.phoneNumber !== undefined) {
            const result = normalizePhoneNumber(body.phoneNumber);
            if (result.error) return res.fail(result.error, 400);
            updates.phoneNumber = result.value;
        }

        const picture = uploadedPictureUrl(req);
        if (picture) updates.picture = picture;

        if (Object.keys(updates).length === 0) {
            return res.fail('No updatable fields provided', 400);
        }

        const Referrer = req.models.Referrer;
        const conflictChecks = [];

        if (updates.email !== undefined && updates.email !== null && updates.email !== referrer.email) {
            conflictChecks.push(
                Referrer.findOne({
                    where: {
                        id: { [Op.ne]: referrer.id },
                        [Op.and]: where(fn('lower', col('email')), updates.email)
                    },
                    attributes: ['id']
                }).then((match) => ({ field: 'email', match }))
            );
        }

        if (updates.phoneNumber !== undefined && updates.phoneNumber !== referrer.phoneNumber) {
            conflictChecks.push(
                Referrer.findOne({
                    where: {
                        id: { [Op.ne]: referrer.id },
                        phoneNumber: updates.phoneNumber
                    },
                    attributes: ['id']
                }).then((match) => ({ field: 'phoneNumber', match }))
            );
        }

        const conflicts = await Promise.all(conflictChecks);
        const conflict = conflicts.find((item) => item.match);
        if (conflict?.field === 'email') {
            return res.fail('A referrer with this email already exists', 409);
        }
        if (conflict?.field === 'phoneNumber') {
            return res.fail('A referrer with this phone number already exists', 409);
        }

        await referrer.update(updates);
        if (typeof referrer.reload === 'function') await referrer.reload();

        return res.success({ user: toSafeReferrer(referrer) }, 'Profile updated successfully');
    } catch (error) {
        if (error?.name === 'SequelizeUniqueConstraintError') {
            const fields = error.fields || {};
            if (fields.email !== undefined) {
                return res.fail('A referrer with this email already exists', 409);
            }
            if (fields.phone_number !== undefined || fields.phoneNumber !== undefined) {
                return res.fail('A referrer with this phone number already exists', 409);
            }
            return res.fail('Email or phone number is already linked to another referrer', 409);
        }

        return next(error);
    }
};

const changePassword = async (req, res, next) => {
    try {
        const referrer = await getAuthenticatedReferrer(req, res);
        if (!referrer) return;

        const { oldPassword, newPassword, confirmPassword } = req.body || {};
        if (typeof oldPassword !== 'string' || !oldPassword) {
            return res.fail('oldPassword is required', 400);
        }
        if (typeof newPassword !== 'string' || !newPassword) {
            return res.fail('newPassword is required', 400);
        }
        if (newPassword.length < MIN_PASSWORD_LENGTH) {
            return res.fail(`Password must be at least ${MIN_PASSWORD_LENGTH} characters`, 400);
        }
        if (Buffer.byteLength(newPassword, 'utf8') > MAX_BCRYPT_PASSWORD_BYTES) {
            return res.fail(`Password must not exceed ${MAX_BCRYPT_PASSWORD_BYTES} bytes`, 400);
        }
        if (confirmPassword !== undefined && confirmPassword !== newPassword) {
            return res.fail('Password confirmation does not match', 400);
        }
        if (oldPassword === newPassword) {
            return res.fail('New password must be different from the current password', 400);
        }
        if (!referrer.passwordHash) {
            return res.fail('Current password is not set for this account', 409);
        }

        let passwordMatches = false;
        try {
            passwordMatches = await bcrypt.compare(oldPassword, referrer.passwordHash);
        } catch (error) {
            passwordMatches = false;
        }

        if (!passwordMatches) {
            return res.fail('Old password is incorrect', 401);
        }

        const passwordHash = await bcrypt.hash(newPassword, 10);
        await referrer.update({ passwordHash });

        return res.success(null, 'Password changed successfully');
    } catch (error) {
        return next(error);
    }
};

module.exports = {
    getProfile,
    updateProfile,
    changePassword
};
