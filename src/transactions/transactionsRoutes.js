const express = require('express');
const router = express.Router();
const { createTransaction, getAllTransactions, getUserTransactions } = require('./transactionsController');
const authenticateToken = require('../../middleware/authMiddleware');
const { body, validationResult } = require('express-validator');

/* Create a new transaction */
router.post('/create/transaction',
    authenticateToken, // Protect the route
    body('userId').isString().withMessage('User ID is required'),
    body('amount').isFloat({ gt: 0 }).withMessage('Amount must be a positive number'),

    async (req, res) => {
        // Validate request body
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(422).json({ errors: errors.array() });
        }

        try {
            await createTransaction(req, res);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
);

/* Get all transactions */
router.get('/transactions', authenticateToken, async (req, res) => {
    try {
        const transactions = await getAllTransactions(req, res);
        res.status(200).json(transactions);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/* Get user transactions */
router.get('/transactions/:userId', authenticateToken, async (req, res) => {
    try {
        const { userId } = req.params;
        if (!userId) {
            return res.status(400).json({ error: 'User ID is required.' });
        }
        return await getUserTransactions(req, res);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


module.exports = router;
