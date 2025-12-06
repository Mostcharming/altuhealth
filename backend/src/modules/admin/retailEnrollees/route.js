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

const router = require('express').Router();

// Retail Enrollee CRUD routes
router.post('/', createRetailEnrollee);
router.get('/', getRetailEnrollees);
router.get('/:retailEnrolleeId', getRetailEnrolleeById);
router.put('/:retailEnrolleeId', updateRetailEnrollee);
router.delete('/:retailEnrolleeId', deleteRetailEnrollee);

// Medical History routes
router.post('/:retailEnrolleeId/medical-histories', createRetailEnrolleeMedicalHistory);
router.get('/:retailEnrolleeId/medical-histories', getRetailEnrolleeMedicalHistories);
router.get('/:retailEnrolleeId/medical-histories/:medicalHistoryId', getRetailEnrolleeMedicalHistoryById);
router.put('/:retailEnrolleeId/medical-histories/:medicalHistoryId', updateRetailEnrolleeMedicalHistory);
router.delete('/:retailEnrolleeId/medical-histories/:medicalHistoryId', deleteRetailEnrolleeMedicalHistory);

module.exports = router;
