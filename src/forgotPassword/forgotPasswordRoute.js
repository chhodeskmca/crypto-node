const express = require('express');
const router = express.Router();
const { createOrUpdateForgotPasswordEntry, resetPassword } = require('./forgotPasswordController');
const originCheckMiddleware = require('../../middleware/originCheckMiddleware');

/* Public routes */
router.post('/forgot-password', originCheckMiddleware, async (req, res) => {
    try {
        await createOrUpdateForgotPasswordEntry(req, res);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

router.post('/reset-password', originCheckMiddleware, async (req, res) => {
    try {
        await resetPassword(req, res);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

module.exports = router;
