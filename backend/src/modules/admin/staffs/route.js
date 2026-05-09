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

// CRUD for staffs
router.post('/', Staff.createStaff);
router.get('/list', Staff.listStaffs);
router.get('/enrollment-status-options', Staff.getEnrollmentStatusOptions);
router.get('/:id', Staff.getStaff);
router.put('/:id', Staff.updateStaff);
router.delete('/:id', Staff.deleteStaff);
router.post('/:id/resend-enrollment-notification', Staff.resendEnrollmentNotification);

// Bulk operations
router.post('/bulk/notify', Staff.bulkNotifyStaffs);
router.post('/bulk/enroll', Staff.bulkEnrollStaffs);
router.post('/bulk/create', upload.single('file'), Staff.bulkCreateStaffs);

module.exports = router;
