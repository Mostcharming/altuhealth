const express = require('express');
const router = express.Router();
const Roles = require('./controller');

router.use('/privileges', require('../privileges/route'));
// CRUD
router.post('/', Roles.createRole);
router.get('/list', Roles.listRoles);
router.get('/:id', Roles.getRole);
router.put('/:id', Roles.updateRole);
router.delete('/:id', Roles.deleteRole);






module.exports = router;