const express = require('express')
const router = express.Router()
const {
    getPayoutSettingsController,
    updatePayoutSettingsController,
    createPayoutRequestController,
    getAllPayoutRequestsController,
    createPayoutRequestFromBalanceController
} = require('./payoutController')
const { body, validationResult } = require('express-validator')
const authenticateToken = require('../../../middleware/authMiddleware')

// Fetch payout settings
router.get('/payout/settings', getPayoutSettingsController)

// Update payout settings
router.post(
    '/payout/settings',
    body('minimumBalance').isFloat().withMessage('Minimum balance must be a number'),
    updatePayoutSettingsController
)

// Create payout request
router.post(
    '/payout/request',
    createPayoutRequestController
)

// Get all payout requests
router.get('/payout/requests', authenticateToken, getAllPayoutRequestsController)

// Define the route for the cron job
router.get('/payout-request/cron', authenticateToken, createPayoutRequestFromBalanceController)

module.exports = router