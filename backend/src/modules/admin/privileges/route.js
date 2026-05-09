const express = require('express');
const router = express.Router();
const { responseFormatter, errorHandler } = require('../../../middlewares/common/responseFormatter');
const Privileges = require('./controller');
const { securityMiddleware } = require('../../../middlewares/common/security');


// list all privileges
router.get('/list', Privileges.listPrivileges);


module.exports = router;
