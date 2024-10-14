const express = require('express')
const router = express.Router()
const DefaultMiningController = require('./defaultMiningController');
const authenticateToken = require('../../middleware/authMiddleware')

// Import validation rules from the validators directory
const Validator = require('../../validators/miningValidator')

// Update Default Mining
router.put(
    '/default-mining',
    authenticateToken,
    Validator.updateDefaultMiningValidation,
    DefaultMiningController.updateDefaultMining
)

// Get Default Mining
router.get(
    '/default-mining',
    authenticateToken,
    DefaultMiningController.getDefaultMining
)


module.exports = router