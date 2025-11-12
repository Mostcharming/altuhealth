const express = require('express');
const router = express.Router();
const { responseFormatter, errorHandler } = require('../../../middlewares/common/responseFormatter');
const Roles = require('./controller');
const { securityMiddleware } = require('../../../middlewares/common/security');

router.use(responseFormatter);
router.use(securityMiddleware);

// CRUD
router.post('/', Roles.createRole);
router.get('/list', Roles.listRoles);
router.get('/:id', Roles.getRole);
router.put('/:id', Roles.updateRole);
router.delete('/:id', Roles.deleteRole);

// assign privileges
router.put('/:id/privileges', Roles.assignPrivileges);

router.use(errorHandler);

module.exports = router;