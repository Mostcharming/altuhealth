const { makeLogin } = require("../../common/login.controller");

const login = makeLogin('Admin');

module.exports = {
    login,
};