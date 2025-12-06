const {
    createRetailEnrollee,
    getRetailEnrollees,
    getRetailEnrolleeById,
    updateRetailEnrollee,
    deleteRetailEnrollee
} = require('./controller');

const {
    createRetailEnrolleeMedicalHistory,
    getRetailEnrolleeMedicalHistories,
    getRetailEnrolleeMedicalHistoryById,
    updateRetailEnrolleeMedicalHistory,
    deleteRetailEnrolleeMedicalHistory
} = require('./medicalHistoryController');

const {
    createRetailEnrolleeDependent,
    getRetailEnrolleeDependents,
    getRetailEnrolleeDependentById,
    updateRetailEnrolleeDependent,
    deleteRetailEnrolleeDependent
} = require('./dependentController');

const router = require('express').Router();

// Retail Enrollee CRUD routes
router.post('/', createRetailEnrollee);
router.get('/', getRetailEnrollees);
router.get('/:retailEnrolleeId', getRetailEnrolleeById);
router.put('/:retailEnrolleeId', updateRetailEnrollee);
router.delete('/:retailEnrolleeId', deleteRetailEnrollee);

// Dependents routes
router.post('/:retailEnrolleeId/dependents', createRetailEnrolleeDependent);
router.get('/:retailEnrolleeId/dependents', getRetailEnrolleeDependents);
router.get('/:retailEnrolleeId/dependents/:dependentId', getRetailEnrolleeDependentById);
router.put('/:retailEnrolleeId/dependents/:dependentId', updateRetailEnrolleeDependent);
router.delete('/:retailEnrolleeId/dependents/:dependentId', deleteRetailEnrolleeDependent);

// Medical History routes
router.post('/:retailEnrolleeId/medical-histories', createRetailEnrolleeMedicalHistory);
router.get('/:retailEnrolleeId/medical-histories', getRetailEnrolleeMedicalHistories);
router.get('/:retailEnrolleeId/medical-histories/:medicalHistoryId', getRetailEnrolleeMedicalHistoryById);
router.put('/:retailEnrolleeId/medical-histories/:medicalHistoryId', updateRetailEnrolleeMedicalHistory);
router.delete('/:retailEnrolleeId/medical-histories/:medicalHistoryId', deleteRetailEnrolleeMedicalHistory);

module.exports = router;
