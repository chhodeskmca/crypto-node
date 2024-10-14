const Transaction = require('./transactionsModel');
const Balance = require('../balance/balanceModel');
const PayoutRequest = require('../payout/request/payoutRequestModel');
const { successResponse, errorResponse } = require('../../utils/apiResponse');
const { ObjectId } = require('../../config/db');
const { ROLE_TYPES } = require('../../config');

// Create a new transaction
exports.createTransaction = async ({ userId, amount }) => {
    try {
        // Retrieve the user's balance
        const balance = await Balance.findOne({ userId });

        // Check if the balance exists and if it is sufficient
        if (balance) {
            // Create the transaction record
            const transaction = await Transaction.create({
                userId,
                amount,
                kaspa: balance.kaspa,
                electricity: balance.electricity
            });

            if (transaction) {
                // Update the user's balance
                balance.balance = 0;
                balance.kaspa = 0;
                balance.electricity = 0;
                await balance.save();

                // Remove payout requests for the user
                await PayoutRequest.deleteMany({ userId });

                return successResponse({ message: 'Transaction successful!!' });
            } else {
                throw new Error('Transaction failed!!');
            }
        } else {
            throw new Error('Insufficient balance!!');
        }
    } catch (error) {
        throw new Error(error.message);
    }
};

// Get all transactions
exports.getAllTransactions = async (req) => {

    try {
        const aggregation = [
            {
                $lookup: {
                    from: 'users',
                    localField: 'userId',
                    foreignField: '_id',
                    as: 'get_user',
                },
            },
            {
                $unwind: {
                    path: '$get_user',
                    preserveNullAndEmptyArrays: true
                }
            },
        ]

        if (req.accessType === ROLE_TYPES.ADMIN) {
            aggregation.push(
                {
                    $match: {
                        'get_user.createdBy': new ObjectId(req.userId)
                    }
                }
            )
        }
        const transactions = await Transaction.aggregate([
            ...aggregation,
            {
                $sort: {
                    createdAt: -1
                }
            }
        ])

        if (transactions.length > 0) {
            return successResponse(transactions)
        } else {
            throw new Error('No transactions found')
        }
    } catch (error) {
        throw new Error(error.message);
    }
};

// Get transactions for a specific user
exports.getUserTransactions = async (userId) => {
    if (userId) {
        try {
            const transactions = await Transaction.find({ userId })
                .populate('user') // Assumes a `user` field exists to populate user details
                .sort({ _id: -1 }); // Sort by descending order

            if (transactions.length > 0) {
                return successResponse(transactions);
            } else {
                throw new Error('No transactions found for the user.');
            }
        } catch (error) {
            throw new Error(error.message);
        }
    } else {
        throw new Error('User ID is required.');
    }
};
