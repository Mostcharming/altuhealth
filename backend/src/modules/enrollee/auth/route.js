// Enrollee authentication route
const express = require('express');
const router = express.Router();

const { responseFormatter, errorHandler } = require('../../../middlewares/common/responseFormatter');
const { login, forgot, reset } = require('./controller');

router.use(responseFormatter);

router.post('/login', login);
router.post('/forgot', forgot);
router.post('/reset', reset);

router.use(errorHandler);

module.exports = router;
