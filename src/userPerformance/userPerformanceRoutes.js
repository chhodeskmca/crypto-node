const express = require('express');
const router = express.Router();
const { saveRequestedPerformance } = require('./userPerformanceController');
const authenticateToken = require('../../middleware/authMiddleware');
const { body, validationResult } = require('express-validator');

// Import email service
const emailService = require('../../utils/emailService');

router.post('/save-requested-performance',
    authenticateToken,
    body('userId').isString().withMessage('User ID is required'),
    body('requestedPerformance').isString().withMessage('Requested performance is required'),
    async (req, res) => {
        // Validate request body
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(422).json({ errors: errors.array() });
        }

        try {
            await saveRequestedPerformance(req, res, emailService);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
);

module.exports = router;
