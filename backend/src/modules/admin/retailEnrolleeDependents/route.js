const express = require('express');
const router = express.Router();
const RetailEnrolleeDependent = require('./controller');
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
router.get('/relationship-options', RetailEnrolleeDependent.getRelationshipOptions);

// CRUD for retail enrollee dependents
router.post('/', RetailEnrolleeDependent.createRetailEnrolleeDependent);
router.get('/', RetailEnrolleeDependent.listRetailEnrolleeDependents);
router.get('/:id', RetailEnrolleeDependent.getRetailEnrolleeDependent);
router.put('/:id', RetailEnrolleeDependent.updateRetailEnrolleeDependent);
router.delete('/:id', RetailEnrolleeDependent.deleteRetailEnrolleeDependent);

// ID Card and verification routes for dependents (must come before medical history routes)
router.get('/:dependentId/download-id-card', RetailEnrolleeDependent.downloadIdCard);
router.post('/:dependentId/resend-verification-code', RetailEnrolleeDependent.resendVerificationCode);

// Medical History routes for dependents
router.post('/:dependentId/medical-histories', createMedicalHistory);
router.get('/:dependentId/medical-histories', getMedicalHistories);
router.put('/:dependentId/medical-histories/:medicalHistoryId', updateMedicalHistory);
router.delete('/:dependentId/medical-histories/:medicalHistoryId', deleteMedicalHistory);

// Authorization Code routes for dependents
router.post('/:dependentId/authorization-codes', createAuthorizationCode);
router.get('/:dependentId/authorization-codes', getAuthorizationCodes);
router.get('/:dependentId/authorization-codes/:authorizationCodeId', getAuthorizationCodeById);
router.put('/:dependentId/authorization-codes/:authorizationCodeId/use', useAuthorizationCode);
router.put('/:dependentId/authorization-codes/:authorizationCodeId', updateAuthorizationCode);
router.put('/:dependentId/authorization-codes/:authorizationCodeId/cancel', cancelAuthorizationCode);
router.delete('/:dependentId/authorization-codes/:authorizationCodeId', deleteAuthorizationCode);

module.exports = router;
