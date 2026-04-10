const express = require('express');
const router = express.Router();
const EnrolleeDependent = require('./controller');
const { createMedicalHistory, getMedicalHistories, updateMedicalHistory, deleteMedicalHistory } = require('./medicalHistoryController');
const { createAuthorizationCode, getAuthorizationCodes, getAuthorizationCodeById, useAuthorizationCode, updateAuthorizationCode, cancelAuthorizationCode, deleteAuthorizationCode } = require('./authorizationCodeController');
const multer = require('multer');
const path = require('path');

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadDir = path.join(__dirname, '../../../uploads/dependent-bulk');
        const fs = require('fs');
        fs.mkdirSync(uploadDir, { recursive: true });
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const ext = path.extname(file.originalname) || '';
        const name = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
        cb(null, name);
    }
});

const fileFilter = (req, file, cb) => {
    const allowed = ['text/csv', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/vnd.ms-excel'];
    if (allowed.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type. Only CSV and Excel files are allowed'));
    }
};

const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 10 * 1024 * 1024 } // 10MB
});

// Relationship options route (must come before :id routes)
router.get('/relationship-options', EnrolleeDependent.getRelationshipOptions);

// Bulk operations (must come before :id routes)
router.post('/bulk/create', upload.single('file'), EnrolleeDependent.bulkCreateEnrolleeDependents);
router.post('/bulk/verify', EnrolleeDependent.bulkVerifyEnrolleeDependents);

// CRUD for enrollee dependents
router.post('/', EnrolleeDependent.createEnrolleeDependent);
router.get('/', EnrolleeDependent.listEnrolleeDependents);
router.get('/:id', EnrolleeDependent.getEnrolleeDependent);
router.put('/:id', EnrolleeDependent.updateEnrolleeDependent);
router.delete('/:id', EnrolleeDependent.deleteEnrolleeDependent);

// ID Card and verification routes for dependents (must come before medical history routes)
router.get('/:dependentId/download-id-card', EnrolleeDependent.downloadIdCard);
router.post('/:dependentId/resend-verification-code', EnrolleeDependent.resendVerificationCode);

// Medical History routes for dependents
router.post('/:dependentId/medical-histories', createMedicalHistory);
router.get('/:dependentId/medical-histories', getMedicalHistories);
router.put('/:dependentId/medical-histories/:medicalHistoryId', updateMedicalHistory);
router.delete('/:dependentId/medical-histories/:medicalHistoryId', deleteMedicalHistory);

// Authorization Code routes for dependents
router.post('/:dependentId/authorization-codes', EnrolleeDependent.createAuthorizationCode);
router.get('/:dependentId/authorization-codes', EnrolleeDependent.getAuthorizationCodes);
router.get('/:dependentId/authorization-codes/:authorizationCodeId', EnrolleeDependent.getAuthorizationCodeById);
router.put('/:dependentId/authorization-codes/:authorizationCodeId/use', EnrolleeDependent.useAuthorizationCode);
router.put('/:dependentId/authorization-codes/:authorizationCodeId', EnrolleeDependent.updateAuthorizationCode);
router.put('/:dependentId/authorization-codes/:authorizationCodeId/cancel', EnrolleeDependent.cancelAuthorizationCode);
router.delete('/:dependentId/authorization-codes/:authorizationCodeId', EnrolleeDependent.deleteAuthorizationCode);

module.exports = router;
