'use strict';

const router = require('express').Router();
const uploadProfileImage = require('../../../middlewares/common/uploadProfileImage');
const { getProfile, updateProfile, changePassword } = require('./controller');

router.get('/profile', getProfile);
router.put('/profile', uploadProfileImage(), updateProfile);
router.post('/password', changePassword);

module.exports = router;
