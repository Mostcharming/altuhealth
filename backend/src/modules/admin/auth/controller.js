const { signToken } = require('../../../middlewares/common/security');

const login = async (req, res, next) => {
    try {
        const { email, policyNumber, password } = req.body || {};

        if (!password) return res.fail('Password is required', 400);
        if (!email && !policyNumber) return res.fail('Provide email or policyNumber', 400);

        const { Admin, PolicyNumber } = req.models || {};
        if (!Admin) return res.fail('Server configuration error (models missing)', 500);

        let admin = null;

        if (policyNumber) {
            if (!PolicyNumber) return res.fail('Server configuration error (Policy model missing)', 500);

            const policy = await PolicyNumber.findOne({ where: { policyNumber } });
            if (!policy || policy.userType !== 'Admin') return res.fail('Invalid credentials', 401);

            admin = await Admin.findByPk(policy.userId);
        } else if (email) {
            admin = await Admin.findOne({ where: { email } });
        }

        if (!admin) return res.fail('Invalid credentials', 401);

        let passwordMatches = false;
        if (admin.passwordHash) {
            try {
                const bcrypt = require('bcrypt');
                passwordMatches = await bcrypt.compare(password, admin.passwordHash);
            } catch (e) {
                passwordMatches = admin.passwordHash === password;
            }
        }

        if (!passwordMatches) return res.fail('Invalid credentials', 401);

        if (admin.status && admin.status !== 'active') return res.fail('Account is not active', 403);

        const safeUser = {
            id: admin.id,
            firstName: admin.firstName,
            lastName: admin.lastName,
            email: admin.email,
            picture: admin.picture || null,
            phoneNumber: admin.phoneNumber || null,
            status: admin.status || 'active'
        };

        let roleInfo = null;
        try {
            const { UserRole, Role } = req.models || {};
            if (UserRole && Role) {
                const userRole = await UserRole.findOne({ where: { userId: admin.id, userType: 'Admin' } });
                if (userRole) {
                    const role = await Role.findByPk(userRole.roleId);
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

        safeUser.role = roleInfo;

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

const errorExample = (req, res) => {
    return res.fail('This is a handled error example', 400, { details: 'Invalid input example' });
};

const exceptionExample = (req, res, next) => {
    const err = new Error('Authentication failed (example)');
    err.status = 401;
    err.data = { reason: 'invalid_token' };
    return next(err);
};

module.exports = {
    login,
    errorExample,
    exceptionExample,
};