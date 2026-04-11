const {
    createRetailEnrollee,
    getRetailEnrollees,
    getRetailEnrolleeById,
    updateRetailEnrollee,
    deleteRetailEnrollee,
    downloadIdCard,
    resendVerificationCode
} = require('./controller');

const {
    createRetailEnrolleeMedicalHistory,
    getRetailEnrolleeMedicalHistories,
    getRetailEnrolleeMedicalHistoryById,
    updateRetailEnrolleeMedicalHistory,
    deleteRetailEnrolleeMedicalHistory
} = require('./medicalHistoryController');

const {
    createRetailEnrolleeAuthorizationCode,
    getRetailEnrolleeAuthorizationCodes,
    getRetailEnrolleeAuthorizationCodeById,
    updateRetailEnrolleeAuthorizationCode,
    deleteRetailEnrolleeAuthorizationCode
} = require('./authorizationCodeController');

const {
    getRetailEnrolleeBenefits,
    getRetailEnrolleeBenefitById
} = require('./benefitsController');

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
router.get('/:retailEnrolleeId/download-id-card', downloadIdCard);
router.post('/:retailEnrolleeId/resend-verification-code', resendVerificationCode);

// Benefits routes
router.get('/:retailEnrolleeId/benefits', getRetailEnrolleeBenefits);
router.get('/:retailEnrolleeId/benefits/:benefitId', getRetailEnrolleeBenefitById);

// Authorization Codes routes
router.post('/:retailEnrolleeId/authorization-codes', createRetailEnrolleeAuthorizationCode);
router.get('/:retailEnrolleeId/authorization-codes', getRetailEnrolleeAuthorizationCodes);
router.get('/:retailEnrolleeId/authorization-codes/:authorizationCodeId', getRetailEnrolleeAuthorizationCodeById);
router.put('/:retailEnrolleeId/authorization-codes/:authorizationCodeId', updateRetailEnrolleeAuthorizationCode);
router.delete('/:retailEnrolleeId/authorization-codes/:authorizationCodeId', deleteRetailEnrolleeAuthorizationCode);

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
