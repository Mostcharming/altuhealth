const login = (req, res) => {
    const { email } = req.body || {};
    return res.success(
        { user: { email: email || 'unknown' }, token: 'stub-token' },
        'Logged in (stub)'
    );
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