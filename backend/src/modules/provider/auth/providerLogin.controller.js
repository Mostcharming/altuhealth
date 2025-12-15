const { signToken } = require('../../../middlewares/common/security');
const Sequelize = require('sequelize');

const providerLogin = async (req, res, next) => {
    try {
        const { email, upn, password, remember, location } = req.body || {};

        if (!password) return res.fail('Password is required', 400);
        if (!email && !upn) return res.fail('Provide email or UPN', 400);

        const ProviderModel = req.models && req.models['Provider'];
        if (!ProviderModel) return res.fail('Server configuration error (models missing)', 500);

        let provider = null;

        if (upn) {
            const lookupUPN = (typeof upn === 'string') ? upn.toUpperCase() : upn;
            provider = await ProviderModel.findOne({ where: { upn: lookupUPN } });
        } else if (email) {
            const lookupEmail = (typeof email === 'string') ? email.toLowerCase() : email;
            try {
                provider = await ProviderModel.findOne({
                    where: Sequelize.where(Sequelize.fn('lower', Sequelize.col('email')), lookupEmail)
                });
            } catch (e) {
                // fallback: if the DB or dialect doesn't support lower() in this context, try a plain lookup
                provider = await ProviderModel.findOne({ where: { email: lookupEmail } });
            }
        }

        if (!provider) return res.fail('Invalid credentials', 401);

        let passwordMatches = false;
        if (provider.password) {
            try {
                const bcrypt = require('bcrypt');
                passwordMatches = await bcrypt.compare(password, provider.password);
            } catch (e) {
                passwordMatches = provider.password === password;
            }
        }

        if (!passwordMatches) return res.fail('Invalid credentials', 401);

        // require explicit 'active' status — any other value (including null/undefined) is not allowed
        if (provider.status !== 'active') return res.fail('Account is not active', 403);

        if (location && (location.lat !== undefined || location.lon !== undefined || location.currentLocation !== undefined)) {
            const updates = {};
            if (location.lat !== undefined) updates.latitude = location.lat;
            if (location.lon !== undefined) updates.longitude = location.lon;
            if (location.currentLocation !== undefined) updates.currentLocation = location.currentLocation;
            try {
                if (provider && typeof provider.update === 'function') {
                    await provider.update(updates);
                } else {
                    if (ProviderModel) await ProviderModel.update(updates, { where: { id: provider.id } });
                }
                if (provider && typeof provider.reload === 'function') await provider.reload();
            } catch (e) {
                console.error('Failed to update provider location:', e && e.message ? e.message : e);
            }
        }

        const safeProvider = {
            id: provider.id,
            name: provider.name,
            email: provider.email,
            phoneNumber: provider.phoneNumber || null,
            upn: provider.upn,
            category: provider.category,
            status: provider.status || 'active',
            type: 'Provider'
        };

        let signedToken;
        try {
            signedToken = signToken(safeProvider);
        } catch (err) {
            console.error('JWT signing failed, falling back to opaque token:', err.message);
            return res.fail('Authentication token generation failed', 500);
        }

        return res.success({ user: safeProvider, token: signedToken }, 'Logged in');
    } catch (err) {
        return next(err);
    }
};

module.exports = {
    providerLogin,
};
