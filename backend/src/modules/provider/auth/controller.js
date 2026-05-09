const { providerLogin } = require('./providerLogin.controller');
const { makeForgotPassword } = require("../../common/forgot.controller");
const { makeResetPassword } = require("../../common/reset.controller");

// For providers, use custom login that handles UPN instead of policy number
const login = providerLogin;
const forgot = makeForgotPassword("Provider", {
    policyModelKey: 'Provider',
    userType: 'Provider'
});
const reset = makeResetPassword("Provider", {
    policyModelKey: 'Provider',
    userType: 'Provider'
});

module.exports = {
    login,
    forgot,
    reset,
};
