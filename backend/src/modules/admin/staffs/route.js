const express = require('express');
const router = express.Router();
const Staff = require('./controller');
const multer = require('multer');
const path = require('path');

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadDir = path.join(__dirname, '../../../uploads/staff-bulk');
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
    const extension = path.extname(file.originalname || '').toLowerCase();
    const allowedExtensions = ['.csv', '.xlsx', '.xls'];
    if (allowedExtensions.includes(extension)) {
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

function uploadStaffFile(req, res, next) {
    upload.single('file')(req, res, (error) => {
        if (!error) return next();
        if (error.code === 'LIMIT_FILE_SIZE') {
            return res.fail('File is too large. Maximum size is 10MB', 400);
        }
        return res.fail(error.message || 'Unable to upload staff file', 400);
    });
}

function extendBulkUploadTimeout(req, res, next) {
    req.setTimeout(120000);
    res.setTimeout(120000);
    next();
}

// CRUD for staffs
router.post('/', Staff.createStaff);
router.get('/list', Staff.listStaffs);
router.get('/enrollment-status-options', Staff.getEnrollmentStatusOptions);
router.get('/company/:companyId/download', Staff.downloadCompanyStaffs);
router.get('/company/:companyId/enrollees/download', Staff.downloadCompanyEnrollees);
router.get('/:id', Staff.getStaff);
router.put('/:id', Staff.updateStaff);
router.delete('/:id', Staff.deleteStaff);
router.post('/:id/resend-enrollment-notification', Staff.resendEnrollmentNotification);

// Bulk operations
router.post('/bulk/notify', Staff.bulkNotifyStaffs);
router.post('/bulk/enroll', Staff.bulkEnrollStaffs);
router.post('/bulk/create', extendBulkUploadTimeout, uploadStaffFile, Staff.bulkCreateStaffs);

module.exports = router;
