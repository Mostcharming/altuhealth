const {
    createEnrollee,
    getEnrollees,
    getEnrolleeById,
    updateEnrollee,
    deleteEnrollee,
    sendVerificationCode,
    verifyEnrollee,
    resendVerificationCode,
    downloadIdCard
} = require('./controller');

const {
    createMedicalHistory,
    getMedicalHistories,
    updateMedicalHistory,
    deleteMedicalHistory
} = require('./medicalHistoryController');

const {
    createAuthorizationCode,
    getAuthorizationCodes,
    getAuthorizationCodeById,
    useAuthorizationCode,
    updateAuthorizationCode,
    cancelAuthorizationCode,
    deleteAuthorizationCode
} = require('./authorizationCodeController');

const {
    getEnrolleeBenefits,
    getEnrolleeBenefitById
} = require('./benefitsController');

const router = require('express').Router();

// Enrollee routes
router.get('/', getEnrollees);
router.get('/:enrolleeId', getEnrolleeById);
router.post('/', createEnrollee);
router.put('/:enrolleeId', updateEnrollee);
router.delete('/:enrolleeId', deleteEnrollee);

// Medical History routes
router.post('/:enrolleeId/medical-histories', createMedicalHistory);
router.get('/:enrolleeId/medical-histories', getMedicalHistories);
router.put('/:enrolleeId/medical-histories/:medicalHistoryId', updateMedicalHistory);
router.delete('/:enrolleeId/medical-histories/:medicalHistoryId', deleteMedicalHistory);

// Authorization Code routes
router.post('/:enrolleeId/authorization-codes', createAuthorizationCode);
router.get('/:enrolleeId/authorization-codes', getAuthorizationCodes);
router.get('/:enrolleeId/authorization-codes/:authorizationCodeId', getAuthorizationCodeById);
router.put('/:enrolleeId/authorization-codes/:authorizationCodeId/use', useAuthorizationCode);
router.put('/:enrolleeId/authorization-codes/:authorizationCodeId', updateAuthorizationCode);
router.put('/:enrolleeId/authorization-codes/:authorizationCodeId/cancel', cancelAuthorizationCode);
router.delete('/:enrolleeId/authorization-codes/:authorizationCodeId', deleteAuthorizationCode);

// Benefits routes
router.get('/:enrolleeId/benefits', getEnrolleeBenefits);
router.get('/:enrolleeId/benefits/:benefitId', getEnrolleeBenefitById);

// Verification routes
router.post('/:enrolleeId/send-verification-code', sendVerificationCode);
router.post('/:enrolleeId/verify', verifyEnrollee);
router.post('/:enrolleeId/resend-verification-code', resendVerificationCode);

// ID Card routes
router.get('/:enrolleeId/download-id-card', downloadIdCard);

module.exports = router;
