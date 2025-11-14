const router = require('express').Router();
const { updateProfile, changePassword, getProfile } = require('./controller');

// routes expect security middleware to have attached req.user and req.models
router.get('/profile', getProfile);
router.put('/profile', updateProfile);
router.post('/password', changePassword);

module.exports = router;
