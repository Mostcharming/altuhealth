const express = require('express');
const router = express.Router();
const EnrolleeDependent = require('./controller');
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

// CRUD for enrollee dependents
router.post('/', EnrolleeDependent.createEnrolleeDependent);
router.get('/list', EnrolleeDependent.listEnrolleeDependents);
router.get('/relationship-options', EnrolleeDependent.getRelationshipOptions);
router.get('/:id', EnrolleeDependent.getEnrolleeDependent);
router.put('/:id', EnrolleeDependent.updateEnrolleeDependent);
router.delete('/:id', EnrolleeDependent.deleteEnrolleeDependent);

// Bulk operations
router.post('/bulk/create', upload.single('file'), EnrolleeDependent.bulkCreateEnrolleeDependents);
router.post('/bulk/verify', EnrolleeDependent.bulkVerifyEnrolleeDependents);

module.exports = router;
