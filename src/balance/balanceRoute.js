const express = require('express');
const router = express.Router();
const authenticateToken = require('../../middleware/authMiddleware');
const { updateUserElectricity } = require('./balanceController');

router.post('/balance/update-electricity', authenticateToken, updateUserElectricity);

module.exports = router;