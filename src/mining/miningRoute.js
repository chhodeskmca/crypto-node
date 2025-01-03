const express = require('express')
const router = express.Router()
const MiningController = require('./miningController')
const authenticateToken = require('../../middleware/authMiddleware')

// Import validation rules from the validators directory
const Validator = require('../../validators/miningValidator')


// Get User Earnings
router.post(
    '/user/earning',
    authenticateToken,
    Validator.getUserEarningsValidation,
    MiningController.getUserEarningsController
)

// Get Current Hash Rate
router.get(
    '/mining',
    authenticateToken,
    MiningController.minePerMinuteController
)

module.exports = router