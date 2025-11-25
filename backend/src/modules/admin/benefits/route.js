const express = require('express');
const router = express.Router();
const Benefits = require('./controller');

// CRUD operations for benefits
router.post('/', Benefits.createBenefit);
router.get('/list', Benefits.listBenefits);
router.get('/:id', Benefits.getBenefit);
router.put('/:id', Benefits.updateBenefit);
router.delete('/:id', Benefits.deleteBenefit);

module.exports = router;
