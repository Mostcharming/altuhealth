const { makeLogin } = require("../../common/login.controller");
const { makeForgotPassword } = require("../../common/forgot.controller");
const { makeResetPassword } = require("../../common/reset.controller");

const login = makeLogin("Provider");
const forgot = makeForgotPassword("Provider");
const reset = makeResetPassword("Provider");

module.exports = {
    login,
    forgot,
    reset,
};
