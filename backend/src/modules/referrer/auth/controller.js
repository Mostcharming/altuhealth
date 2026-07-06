'use strict';

const bcrypt = require('bcrypt');
const Sequelize = require('sequelize');
const { signToken } = require('../../../middlewares/common/security');

const normalizeEmail = (email) => (typeof email === 'string' ? email.trim().toLowerCase() : null);
const normalizePhone = (phoneNumber) => (typeof phoneNumber === 'string' ? phoneNumber.trim() : null);

const toSafeReferrer = (referrer) => ({
    id: referrer.id,
    firstName: referrer.firstName,
    lastName: referrer.lastName,
    email: referrer.email,
    phoneNumber: referrer.phoneNumber,
    referralCode: referrer.referralCode,
    status: referrer.status,
    bankName: referrer.bankName,
    accountName: referrer.accountName,
    accountNumber: referrer.accountNumber,
    totalEarning: parseFloat(referrer.totalEarning || 0),
    availableBalance: parseFloat(referrer.availableBalance || 0),
    totalWithdrawn: parseFloat(referrer.totalWithdrawn || 0),
    picture: referrer.picture || null,
    type: 'Referrer'
});

const generateReferralCode = async (Referrer, firstName, lastName) => {
    const prefix = `${String(firstName || '').slice(0, 2)}${String(lastName || '').slice(0, 2)}`
        .replace(/[^a-zA-Z0-9]/g, '')
        .toUpperCase()
        .padEnd(4, 'R');

    for (let i = 0; i < 8; i += 1) {
        const suffix = Math.random().toString(36).slice(2, 8).toUpperCase();
        const referralCode = `${prefix}${suffix}`;
        const exists = await Referrer.findOne({ where: { referralCode } });
        if (!exists) return referralCode;
    }

    return `${prefix}${Date.now().toString(36).toUpperCase()}`;
};

const signup = async (req, res, next) => {
    try {
        const { Referrer } = req.models;
        const {
            firstName,
            lastName,
            phoneNumber,
            email,
            password,
            bankName,
            accountName,
            accountNumber
        } = req.body || {};

        if (!firstName || !lastName || !phoneNumber || !password) {
            return res.fail('firstName, lastName, phoneNumber, and password are required', 400);
        }

        const lookupEmail = normalizeEmail(email);
        const lookupPhone = normalizePhone(phoneNumber);

        const existingConditions = [{ phoneNumber: lookupPhone }];
        if (lookupEmail) {
            existingConditions.push(Sequelize.where(Sequelize.fn('lower', Sequelize.col('email')), lookupEmail));
        }

        const existingReferrer = await Referrer.findOne({
            where: {
                isDeleted: false,
                [Sequelize.Op.or]: existingConditions
            }
        });

        if (existingReferrer) {
            return res.fail('A referrer with this email or phone number already exists', 409);
        }

        const referralCode = await generateReferralCode(Referrer, firstName, lastName);
        const passwordHash = await bcrypt.hash(password, 10);

        const referrer = await Referrer.create({
            firstName,
            lastName,
            phoneNumber: lookupPhone,
            email: lookupEmail,
            referralCode,
            passwordHash,
            bankName,
            accountName,
            accountNumber,
            status: 'active'
        });

        const user = toSafeReferrer(referrer);
        const token = signToken(user);

        return res.success({ user, token }, 'Referrer account created successfully', 201);
    } catch (error) {
        return next(error);
    }
};

const login = async (req, res, next) => {
    try {
        const { Referrer } = req.models;
        const { email, phoneNumber, password } = req.body || {};

        if (!password) return res.fail('Password is required', 400);
        if (!email && !phoneNumber) return res.fail('Provide email or phoneNumber', 400);

        let referrer = null;
        if (email) {
            const lookupEmail = normalizeEmail(email);
            referrer = await Referrer.findOne({
                where: {
                    isDeleted: false,
                    [Sequelize.Op.and]: Sequelize.where(Sequelize.fn('lower', Sequelize.col('email')), lookupEmail)
                }
            });
        } else {
            referrer = await Referrer.findOne({
                where: {
                    isDeleted: false,
                    phoneNumber: normalizePhone(phoneNumber)
                }
            });
        }

        if (!referrer || !referrer.passwordHash) return res.fail('Invalid credentials', 401);

        const passwordMatches = await bcrypt.compare(password, referrer.passwordHash);
        if (!passwordMatches) return res.fail('Invalid credentials', 401);
        if (referrer.status !== 'active') return res.fail('Account is not active', 403);

        const user = toSafeReferrer(referrer);
        const token = signToken(user);

        return res.success({ user, token }, 'Logged in');
    } catch (error) {
        return next(error);
    }
};

module.exports = {
    signup,
    login
};
