'use strict';

module.exports = async function licenseChecker(req, res, next) {
    try {
        const { responseFormatter } = require('./responseFormatter');
        if (typeof res.format !== 'function') responseFormatter(req, res, () => { });

        const db = require('../../database/models');
        const { License } = db;

        const license = await License.findOne();

        if (!license) {
            const message = 'License not found';
            if (typeof res.fail === 'function') return res.fail(message, 500);
            return res.status(500).json({ error: true, message });
        }

        if (license.isLifetime) return next();

        if (!license.expiresAt) {
            const message = 'License invalid';
            if (typeof res.fail === 'function') return res.fail(message, 500);
            return res.status(500).json({ error: true, message });
        }

        const now = new Date();
        const expiresAt = license.expiresAt instanceof Date ? license.expiresAt : new Date(license.expiresAt);

        if (expiresAt < now) {
            const message = 'License has expired';
            if (typeof res.fail === 'function') return res.fail(message, 403);
            return res.status(403).json({ error: true, message });
        }

        req.license = license;

        next();
    } catch (err) {
        console.error('❌ License checker error:', err.message || err);
        const message = 'License validation error';
        if (typeof res.fail === 'function') return res.fail(message, 500);
        return res.status(500).json({ error: true, message });
    }
};
