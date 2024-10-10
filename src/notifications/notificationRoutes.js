const express = require('express');
const router = express.Router();
const { getAll, storeOrUpdate } = require('./notificationController');
const { body, validationResult } = require('express-validator');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure the directory exists
const uploadDir = 'public/notifications';
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Set up multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir); // Specify the directory for file upload
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        cb(null, Date.now() + ext);
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
        const filetypes = /jpg|jpeg|png|svg/;
        const mimetype = filetypes.test(file.mimetype);
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        if (mimetype && extname) {
            return cb(null, true);
        }
        cb(new Error('Invalid file type. Only JPG, JPEG, PNG, and SVG are allowed.'));
    }
});

router.get('/notification', getAll);

router.post('/notification/:id?',
    upload.single('image'),
    body('title').isString().withMessage('Title is required'),
    body('description').isString().withMessage('Description is required'),
    body('status').exists().withMessage('Status is required'),
    body('image').optional().isString().withMessage('Image must be a string'),
    async (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(422).json({ errors: errors.array() });
        }

        try {
            const result = await storeOrUpdate(req, res, req.params.id);
            if (result.status) {
                res.status(result.status).json(result.data);
            } else {
                res.status(result.status).json(result.data);
            }
        } catch (error) {
            next(error);
        }
    }
);

module.exports = router;
