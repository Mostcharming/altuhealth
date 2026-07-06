const express = require('express');
const router = express.Router();
const Benefits = require('./controller');
const multer = require('multer');
const path = require('path');

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadDir = path.join(__dirname, '../../../uploads/benefits-bulk');
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

// CRUD operations for benefits
router.post('/', Benefits.createBenefit);
router.get('/list', Benefits.listBenefits);
router.get('/:id', Benefits.getBenefit);
router.put('/:id', Benefits.updateBenefit);
router.delete('/:id', Benefits.deleteBenefit);

// Bulk operations
router.post('/bulk/create', upload.single('file'), Benefits.bulkCreateBenefits);

module.exports = router;
