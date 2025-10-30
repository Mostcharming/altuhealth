const express = require('express');
const router = express.Router();

const { responseFormatter, errorHandler } = require('../../../middlewares/common/responseFormatter');

router.use(responseFormatter);

function ensureAuthenticated(req, res, next) {
    next();
}

router.post('/login', (req, res) => {
    const { email } = req.body || {};
    return res.success(
        { user: { email: email || 'unknown' }, token: 'stub-token' },
        'Logged in (stub)'
    );
});

router.post('/logout', ensureAuthenticated, (req, res) => {
    return res.success(null, 'Logged out (stub)');
});

router.get('/me', ensureAuthenticated, (req, res) => {
    return res.success({ user: { id: 1, name: 'Admin (stub)' } });
});

router.get('/error-example', (req, res) => {
    return res.fail('This is a handled error example', 400, { details: 'Invalid input example' });
});

router.get('/exception-example', (req, res, next) => {
    const err = new Error('Authentication failed (example)');
    err.status = 401;
    err.data = { reason: 'invalid_token' };
    return next(err);
});

router.use(errorHandler);

module.exports = router;
