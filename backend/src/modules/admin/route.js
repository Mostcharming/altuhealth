const router = require('express').Router();

router.use('/auth', require('./auth/route'));

router.use('/notifications', require('./notifications/route'));
router.use('/roles', require('./roles/route'));



module.exports = router;
