const express = require('express');
const router = express.Router();
const { calculationReport ,sendInvoice} = require('./reportController');

router.post('/calculation-report', async (req, res) => {
    try {
        await calculationReport(req, res);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

router.get('/send-invoice', async (req, res) => {
    try {
        await sendInvoice(req, res);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});


module.exports = router;
