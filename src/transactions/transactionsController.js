const { createTransaction, getAllTransactions, getUserTransactions } = require('./transactionsService');
const { successResponse, errorResponse } = require('../../utils/apiResponse');

// Create a new transaction
exports.createTransaction = async (req, res) => {
    const { userId, amount } = req.body;

    try {
        const result = await createTransaction({ userId, amount });
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json(errorResponse(error.message));
    }
};

// Get all transactions
exports.getAllTransactions = async (req, res) => {
    try {
        return await getAllTransactions(req);
    } catch (error) {
        res.status(500).json(errorResponse(error.message));
    }
};

// Get transactions for a specific user
exports.getUserTransactions = async (req, res) => {
    const { userId } = req.params;

    try {
        const result = await getUserTransactions(userId);
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json(errorResponse(error.message));
    }
};
