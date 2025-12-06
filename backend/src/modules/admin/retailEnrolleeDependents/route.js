const express = require('express');
const router = express.Router({ mergeParams: true });
const {
    createRetailEnrolleeDependent,
    getRetailEnrolleeDependents,
    getRetailEnrolleeDependentById,
    updateRetailEnrolleeDependent,
    deleteRetailEnrolleeDependent,
    getRelationshipOptions
} = require('./controller');

// CRUD for retail enrollee dependents
router.post('/', createRetailEnrolleeDependent);
router.get('/', getRetailEnrolleeDependents);
router.get('/relationship-options', getRelationshipOptions);
router.get('/:dependentId', getRetailEnrolleeDependentById);
router.put('/:dependentId', updateRetailEnrolleeDependent);
router.delete('/:dependentId', deleteRetailEnrolleeDependent);

module.exports = router;
