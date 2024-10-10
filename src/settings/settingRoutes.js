const express = require('express');
const router = express.Router();
const { update, updateStatus, get } = require('./settingController');
const { body, validationResult } = require('express-validator');

router.post('/settings/update',
    body('performanceSettings').isArray().withMessage('Performance Settings are required'),
    async (req, res, next) => {
        const errors = validationResult(req, res);
        if (!errors.isEmpty()) {
            return res.status(422).json({ errors: errors.array() });
        }

        try {
            const result = await update(req, res);
            if (result.status) {
                res.status(200).json(result);
            } else {
                res.status(400).json(result);
            }
        } catch (error) {
            next(error); // Pass the error to the error-handling middleware
        }
    }
);

router.post('/settings/update-status',
    body('twoFactorAuthentication').isBoolean().withMessage('Two Factor Authentication is required'),
    async (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(422).json({ errors: errors.array() });
        }

        try {
            const result = await updateStatus(req);
            if (result.status) {
                res.status(200).json(result);
            } else {
                res.status(400).json(result);
            }
        } catch (error) {
            next(error);
        }
    }
);

router.get('/settings',
    async (req, res, next) => {
        try {
            const result = await get();
            if (result.status) {
                res.status(200).json(result);
            } else {
                res.status(404).json(result);
            }
        } catch (error) {
            next(error);
        }
    }
);

module.exports = router;
