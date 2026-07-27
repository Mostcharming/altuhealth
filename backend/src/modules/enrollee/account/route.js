const router = require('express').Router();
const {
    updateProfile,
    changePassword,
    getProfile,
    getDependentVisitPreference,
    updateDependentVisitPreference
} = require('./controller');
const uploadProfileImage = require('../../../middlewares/common/uploadProfileImage');

// routes expect security middleware to have attached req.user and req.models
router.get('/profile', getProfile);
router.put('/profile', uploadProfileImage(), updateProfile);
router.post('/password', changePassword);
router.get('/dependent-visit-preference', getDependentVisitPreference);
router.put('/dependent-visit-preference', updateDependentVisitPreference);

module.exports = router;
