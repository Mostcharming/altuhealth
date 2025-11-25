const { securityMiddleware } = require('../../middlewares/common/security');

const router = require('express').Router();

router.use('/auth', require('./auth/route'));

router.use(securityMiddleware);
router.use('/account', require('./account/route'));
router.use('/notifications', require('./notifications/route'));
router.use('/roles', require('./roles/route'));
router.use('/units', require('./units/route'));
router.use('/admins', require('./admins/route'));
router.use('/plans', require('./plans/route'));
router.use('/exclusions', require('./exclusions/route'));
router.use('/approvals', require('./approvals/route'));

module.exports = router;
