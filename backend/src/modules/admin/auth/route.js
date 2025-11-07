const express = require('express');
const router = express.Router();

const { responseFormatter, errorHandler } = require('../../../middlewares/common/responseFormatter');
const licenseChecker = require('../../../middlewares/common/licenseChecker');

const { login, } = require('./controller');

router.use(responseFormatter);

router.post('/login', licenseChecker, login);


router.use(errorHandler);

module.exports = router;
