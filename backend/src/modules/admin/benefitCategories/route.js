const express = require('express');
const router = express.Router();
const BenefitCategories = require('./controller');

// CRUD operations for benefit categories
router.post('/', BenefitCategories.createBenefitCategory);
router.get('/list', BenefitCategories.listBenefitCategories);
router.get('/:id', BenefitCategories.getBenefitCategory);
router.put('/:id', BenefitCategories.updateBenefitCategory);
router.delete('/:id', BenefitCategories.deleteBenefitCategory);

module.exports = router;
