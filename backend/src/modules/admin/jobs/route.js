'use strict';

const express = require('express');
const router = express.Router();
const JobsController = require('./controller');

router.get('/list', JobsController.listJobs);
router.get('/:id', JobsController.getJob);
router.post('/:id/run', JobsController.runJob);
router.put('/:id', JobsController.updateJob);

module.exports = router;
