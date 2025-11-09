const router = require('express').Router();

router.use('/auth', require('./auth/route'));

router.use('/notifications', require('./notifications/route'));



module.exports = router;
