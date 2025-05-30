const express = require('express');
const router = express.Router();
const { calculationReport} = require('./reportController');

router.post('/calculation-report', async (req, res) => {
    try {
        await calculationReport(req, res);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

module.exports = router;
