const { securityMiddleware } = require('../../middlewares/common/security');

const router = require('express').Router();

router.use('/auth', require('./auth/route'));

router.use(securityMiddleware);
router.use('/notifications', require('./notifications/route'));
router.use('/roles', require('./roles/route'));



module.exports = router;
