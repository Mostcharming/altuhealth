const express = require('express');
const router = express.Router();
const Admins = require('./controller');

// list, get, create, update, delete
router.get('/list', Admins.listAdmins);
router.get('/:id', Admins.getAdmin);
router.post('/', Admins.createAdmin);
router.put('/:id', Admins.updateAdmin);
router.delete('/:id', Admins.deleteAdmin);

// assign role/unit
router.post('/:id/assign-role', Admins.assignRole);
router.post('/:id/assign-unit', Admins.assignUnit);

module.exports = router;
