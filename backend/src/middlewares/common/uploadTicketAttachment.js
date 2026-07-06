'use strict';

const fs = require('fs');
const path = require('path');

const multer = (() => {
    try {
        return require('multer');
    } catch (e) {
        return null;
    }
})();

function ensureMulterAvailable() {
    if (!multer) throw new Error('Missing dependency: multer. Run `npm install multer`');
}

const config = require('../../config');

const uploadDir = (config && config.uploads && config.uploads.ticketDir)
    ? config.uploads.ticketDir
    : path.resolve(__dirname, '..', '..', 'uploads', 'tickets');

// ensure directory exists
try {
    fs.mkdirSync(uploadDir, { recursive: true });
} catch (e) {
    // ignore, will surface later if permissions prevent creation
}

// multer storage and filters
const storage = multer ? multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const ext = path.extname(file.originalname) || '';
        const name = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
        cb(null, name);
    }
}) : null;

function fileFilter(req, file, cb) {
    // Only allow image files
    const allowedMimes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (allowedMimes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type. Only JPEG/PNG/GIF/WEBP images are allowed'));
    }
}

const upload = multer ? multer({
    storage,
    fileFilter,
    limits: { fileSize: 10 * 1024 * 1024 } // 10MB
}) : null;

// returns an express middleware that accepts single file under field `attachment` by default
function uploadTicketAttachment(fieldName = 'attachment') {
    ensureMulterAvailable();

    return function (req, res, next) {
        const handler = upload.single(fieldName);
        handler(req, res, function (err) {
            if (err) {
                // multer error
                if (err.code === 'LIMIT_FILE_SIZE') return res.fail('File too large (max 10MB)', 400);
                return res.fail(err.message || 'File upload error', 400);
            }

            if (req.file) {
                // attach helpful info for downstream handlers
                req.ticketAttachment = {
                    filename: req.file.filename,
                    path: req.file.path,
                    originalName: req.file.originalname,
                    mimetype: req.file.mimetype,
                    // served at /upload by the server static middleware
                    url: `/upload/${req.file.filename}`
                };
            }

            return next();
        });
    };
}

module.exports = uploadTicketAttachment;
