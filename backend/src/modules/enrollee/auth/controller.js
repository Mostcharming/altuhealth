// Enrollee authentication controller
const { enrolleeLogin } = require('./enrolleeLogin.controller');
const { makeForgotPassword } = require('../../common/forgot.controller');
const { makeResetPassword } = require('../../common/reset.controller');

const login = enrolleeLogin;
const forgot = makeForgotPassword('Enrollee', {
    policyModelKey: 'Enrollee',
    userType: 'Enrollee',
});
const reset = makeResetPassword('Enrollee', {
    policyModelKey: 'Enrollee',
    userType: 'Enrollee',
});

module.exports = {
    login,
    forgot,
    reset,
};
