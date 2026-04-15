const { signToken } = require('../../../middlewares/common/security');
const Sequelize = require('sequelize');

const enrolleeLogin = async (req, res, next) => {
    try {
        const { email, policyNumber, password, remember, location } = req.body || {};
        if (!password) return res.fail('Password is required', 400);
        if (!email && !policyNumber) return res.fail('Provide email or policy number', 400);

        const EnrolleeModel = req.models && req.models['Enrollee'];
        if (!EnrolleeModel) return res.fail('Server configuration error (models missing)', 500);

        let enrollee = null;
        if (email) {
            const lookupValue = (typeof email === 'string') ? email.toLowerCase() : email;
            try {
                enrollee = await EnrolleeModel.findOne({
                    where: Sequelize.where(Sequelize.fn('lower', Sequelize.col('email')), lookupValue)
                });
            } catch (e) {
                enrollee = await EnrolleeModel.findOne({ where: { email: lookupValue } });
            }
        } else if (policyNumber) {
            const lookupPolicyNumber = (typeof policyNumber === 'string') ? policyNumber.toUpperCase() : policyNumber;
            enrollee = await EnrolleeModel.findOne({ where: { policyNumber: lookupPolicyNumber } });
        }

        if (!enrollee) return res.fail('Invalid credentials', 401);

        let passwordMatches = false;
        if (enrollee.password) {
            try {
                const bcrypt = require('bcrypt');
                passwordMatches = await bcrypt.compare(password, enrollee.password);
            } catch (e) {
                passwordMatches = enrollee.password === password;
            }
        }
        if (!passwordMatches) return res.fail('Invalid credentials', 401);
        if (enrollee.isActive !== true) return res.fail('Account is not active', 403);

        if (location && (location.lat !== undefined || location.lon !== undefined || location.currentLocation !== undefined)) {
            const updates = {};
            if (location.lat !== undefined) updates.latitude = location.lat;
            if (location.lon !== undefined) updates.longitude = location.lon;
            if (location.currentLocation !== undefined) updates.currentLocation = location.currentLocation;
            try {
                if (enrollee && typeof enrollee.update === 'function') {
                    await enrollee.update(updates);
                } else {
                    if (EnrolleeModel) await EnrolleeModel.update(updates, { where: { id: enrollee.id } });
                }
                if (enrollee && typeof enrollee.reload === 'function') await enrollee.reload();
            } catch (e) {
                console.error('Failed to update enrollee location:', e && e.message ? e.message : e);
            }
        }

        const safeEnrollee = {
            id: enrollee.id,
            firstName: enrollee.firstName,
            lastName: enrollee.lastName,
            email: enrollee.email,
            phoneNumber: enrollee.phoneNumber || null,
            policyNumber: enrollee.policyNumber,
            status: enrollee.status || 'active',
            type: 'Enrollee',
        };

        let signedToken;
        try {
            signedToken = signToken(safeEnrollee);
        } catch (err) {
            console.error('JWT signing failed, falling back to opaque token:', err.message);
            return res.fail('Authentication token generation failed', 500);
        }

        return res.success({ user: safeEnrollee, token: signedToken }, 'Logged in');
    } catch (err) {
        return next(err);
    }
};

module.exports = {
    enrolleeLogin,
};
