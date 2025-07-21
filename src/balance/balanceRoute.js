const express = require('express');
const router = express.Router();
const authenticateToken = require('../../middleware/authMiddleware');
const { updateUserElectricity, updateUserBalance } = require('./balanceController');

router.post('/balance/update-electricity', authenticateToken, updateUserElectricity);
router.post('/balance/update-balance', authenticateToken, updateUserBalance)

module.exports = router;