const bcrypt = require('bcrypt');

// Controller for enrollee account operations: update profile (excluding email) and change password
const updateProfile = () => async (req, res, next) => {
    try {
        const userId = req.user && req.user.id;
        if (!userId) return res.fail('Unauthorized', 401);

        const body = req.body || {};
        const allowed = [
            'firstName', 'lastName', 'phoneNumber',
            'state', 'country', 'currentLocation', 'latitude', 'longitude',
            'address', 'city', 'lga', 'postalCode'
        ];

        const updates = {};
        for (const key of allowed) {
            if (body[key] !== undefined) updates[key] = body[key];
        }

        // if a file was uploaded, prefer that for picture field
        if (req.profileImage && req.profileImage.filename) {
            // store absolute URL so the DB contains a route like http://host:port/upload/<filename>
            const base = (req.protocol && req.get && req.get('host')) ? `${req.protocol}://${req.get('host')}` : '';
            const rel = req.profileImage.url || `/upload/${req.profileImage.filename}`;
            updates.pictureUrl = base ? `${base}${rel}` : rel;
        }

        if (Object.keys(updates).length === 0) return res.fail('No updatable fields provided', 400);

        const Enrollee = req.models && req.models.Enrollee;
        if (!Enrollee) return res.fail('Server configuration error (Enrollee model missing)', 500);

        const user = await Enrollee.findByPk(userId);
        if (!user) return res.fail('Enrollee not found', 404);

        await user.update(updates);
        if (typeof user.reload === 'function') await user.reload();

        const safeUser = {
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            picture: user.pictureUrl || null,
            phoneNumber: user.phoneNumber || null,
            latitude: user.latitude || null,
            longitude: user.longitude || null,
            currentLocation: user.currentLocation || null,
            state: user.state || null,
            country: user.country || null,
            address: user.address || null,
            city: user.city || null,
            lga: user.lga || null,
            postalCode: user.postalCode || null
        };

        return res.success({ user: safeUser }, 'Profile updated');
    } catch (err) {
        return next(err);
    }
};

const changePassword = () => async (req, res, next) => {
    try {
        const userId = req.user && req.user.id;
        if (!userId) return res.fail('Unauthorized', 401);

        const { oldPassword, newPassword } = req.body || {};
        if (!oldPassword || !newPassword) return res.fail('oldPassword and newPassword are required', 400);
        if (typeof newPassword !== 'string' || newPassword.length < 8) return res.fail('Password must be at least 8 characters', 400);

        const Enrollee = req.models && req.models.Enrollee;
        if (!Enrollee) return res.fail('Server configuration error (Enrollee model missing)', 500);

        const user = await Enrollee.findByPk(userId);
        if (!user) return res.fail('Enrollee not found', 404);

        let matches = false;
        if (user.password) {
            try {
                matches = await bcrypt.compare(oldPassword, user.password);
            } catch (e) {
                // fallback to plain compare if bcrypt fails
                matches = user.password === oldPassword;
            }
        }

        if (!matches) return res.fail('Old password is incorrect', 401);

        const saltRounds = 10;
        const hashed = await bcrypt.hash(newPassword, saltRounds);
        await user.update({ password: hashed });

        return res.success(null, 'Password changed');
    } catch (err) {
        return next(err);
    }
};

const getProfile = () => async (req, res, next) => {
    try {
        const userId = req.user && req.user.id;
        if (!userId) return res.fail('Unauthorized', 401);

        const Enrollee = req.models && req.models.Enrollee;
        if (!Enrollee) return res.fail('Server configuration error (Enrollee model missing)', 500);

        const user = await Enrollee.findByPk(userId);
        if (!user) return res.fail('Enrollee not found', 404);

        const safeUser = {
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            picture: user.pictureUrl || null,
            phoneNumber: user.phoneNumber || null,
            latitude: user.latitude || null,
            longitude: user.longitude || null,
            currentLocation: user.currentLocation || null,
            state: user.state || null,
            country: user.country || null,
            address: user.address || null,
            city: user.city || null,
            lga: user.lga || null,
            postalCode: user.postalCode || null
        };

        return res.success({ user: safeUser }, 'Profile fetched');
    } catch (err) {
        return next(err);
    }
};

module.exports = {
    updateProfile: updateProfile(),
    changePassword: changePassword(),
    getProfile: getProfile()
};
