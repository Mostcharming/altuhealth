const express = require('express');
const router = express.Router();

const { responseFormatter, errorHandler } = require('../../../middlewares/common/responseFormatter');
const licenseChecker = require('../../../middlewares/common/licenseChecker');

const { login, forgot, reset } = require('./controller');

router.use(responseFormatter);

router.post('/login', licenseChecker, login);
router.post('/forgot', forgot);
router.post('/reset', reset);

router.use(errorHandler);

module.exports = router;
