'use strict';

const express = require('express');
const router = express.Router();
const Services = require('./controller');

// CRUD for services
router.post('/', Services.createService);
router.get('/list', Services.listServices);
router.get('/:id', Services.getService);
router.put('/:id', Services.updateService);
router.delete('/:id', Services.deleteService);

module.exports = router;
