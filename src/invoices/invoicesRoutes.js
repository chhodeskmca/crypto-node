const express = require('express');
const router = express.Router();
const authenticateToken = require('../../middleware/authMiddleware');
const { getAllInvoicesController, updateInvoiceStatusController } = require('./invoicesController');

router.get('/paid/invoices', authenticateToken, getAllInvoicesController)
router.put('/invoice/:id/complete', authenticateToken, updateInvoiceStatusController);

module.exports = router;