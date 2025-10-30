const express = require('express');
const router = express.Router();
const Auth = require('./auth/route');

router.use('/auth', Auth);



module.exports = router;
