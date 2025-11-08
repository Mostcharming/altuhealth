const { signToken } = require('../../../middlewares/common/security');

const makeLogin = (modelOrKey, opts = {}) => {
    const policyModelKey = opts.policyModelKey || 'PolicyNumber';
    const userType = opts.userType || (typeof modelOrKey === 'string' ? modelOrKey : 'Admin');

    return async (req, res, next) => {
        try {
            const { email, policyNumber, password, remember, location } = req.body || {};

            if (!password) return res.fail('Password is required', 400);
            if (!email && !policyNumber) return res.fail('Provide email or policyNumber', 400);

            let UserModel = null;
            if (typeof modelOrKey === 'string') {
                UserModel = req.models && req.models[modelOrKey];
            } else {
                UserModel = modelOrKey;
            }
            if (!UserModel) return res.fail('Server configuration error (models missing)', 500);

            let user = null;

            if (policyNumber) {
                const PolicyModel = req.models && req.models[policyModelKey];
                if (!PolicyModel) return res.fail('Server configuration error (Policy model missing)', 500);

                const lookupPolicyNumber = (typeof policyNumber === 'string') ? policyNumber.toUpperCase() : policyNumber;

                const policy = await PolicyModel.findOne({ where: { policy_number: lookupPolicyNumber } });
                if (!policy || policy.user_type !== userType) return res.fail('Invalid credentials', 401);

                user = await UserModel.findByPk(policy.user_id);
            } else if (email) {
                user = await UserModel.findOne({ where: { email } });
            }

            if (!user) return res.fail('Invalid credentials', 401);

            let passwordMatches = false;
            if (user.password_hash) {
                try {
                    const bcrypt = require('bcrypt');
                    passwordMatches = await bcrypt.compare(password, user.password_hash);
                } catch (e) {
                    passwordMatches = user.password_hash === password;
                }
            }

            if (!passwordMatches) return res.fail('Invalid credentials', 401);

            if (user.status && user.status !== 'active') return res.fail('Account is not active', 403);

            if (location && (location.lat !== undefined || location.lon !== undefined || location.currentLocation !== undefined)) {
                const updates = {};
                if (location.lat !== undefined) updates.latitude = location.lat;
                if (location.lon !== undefined) updates.longitude = location.lon;
                if (location.currentLocation !== undefined) updates.current_location = location.currentLocation;
                try {
                    if (user && typeof user.update === 'function') {
                        await user.update(updates);
                    } else {
                        const { [typeof modelOrKey === 'string' ? modelOrKey : 'User']: UserModelFromReq } = req.models || {};
                        if (UserModelFromReq) await UserModelFromReq.update(updates, { where: { id: user.id } });
                    }
                    if (user && typeof user.reload === 'function') await user.reload();
                } catch (e) {
                    console.error('Failed to update user location:', e && e.message ? e.message : e);
                }
            }

            const safeUser = {
                id: user.id,
                firstName: user.first_name,
                lastName: user.last_name,
                email: user.email,
                picture: user.picture || null,
                phoneNumber: user.phone_number || null,
                status: user.status || 'active',
                latitude: user.latitude || null,
                longitude: user.longitude || null,
                currentLocation: user.current_location || null
            };

            let roleInfo = null;
            try {
                const { UserRole, Role } = req.models || {};
                if (UserRole && Role) {
                    const userRole = await UserRole.findOne({ where: { user_id: user.id, user_type: userType } });
                    if (userRole) {
                        const role = await Role.findByPk(userRole.role_id || userRole.roleId);
                        if (role) {
                            roleInfo = {
                                id: role.id,
                                name: role.name,
                                description: role.description || null
                            };
                        }
                    }
                }
            } catch (err) {
                console.error('Role lookup failed:', err && err.message ? err.message : err);
            }

            safeUser.role = roleInfo ? roleInfo.name : null;

            let signedToken;
            try {
                signedToken = signToken(safeUser);
            } catch (err) {
                console.error('JWT signing failed, falling back to opaque token:', err.message);
                return res.fail('Authentication token generation failed', 500);
            }

            return res.success({ user: safeUser, token: signedToken }, 'Logged in');
        } catch (err) {
            return next(err);
        }
    };
};

module.exports = {
    makeLogin,
};