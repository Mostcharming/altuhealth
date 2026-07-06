'use strict';

const express = require('express');
const router = express.Router();
const AuditLogs = require('./controller');

router.get('/list', AuditLogs.listAuditLogs);
router.get('/:id', AuditLogs.getAuditLog);

module.exports = router;
