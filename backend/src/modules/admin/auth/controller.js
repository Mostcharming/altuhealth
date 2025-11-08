const { makeLogin } = require('../../common/auth/controller');

const login = makeLogin('Admin');

module.exports = {
    login,
};