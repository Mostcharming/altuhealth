'use strict';

const express = require('express');
const router = express.Router();
const ReferralPrograms = require('./controller');

// CRUD for referral programs
router.post('/', ReferralPrograms.createReferralProgram);
router.get('/list', ReferralPrograms.listReferralPrograms);
router.get('/:id', ReferralPrograms.getReferralProgram);
router.put('/:id', ReferralPrograms.updateReferralProgram);
router.delete('/:id', ReferralPrograms.deleteReferralProgram);

// Program status management
router.patch('/:id/status', ReferralPrograms.updateProgramStatus);

module.exports = router;
