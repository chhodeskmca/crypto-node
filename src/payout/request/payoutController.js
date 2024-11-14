const PayoutServices = require('./payoutService')
const { validationResult } = require('express-validator')
const { successResponse, errorResponse } = require('../../../utils/apiResponse')


// Controller for fetching payout settings
exports.getPayoutSettingsController = async (req, res) => {
    try {
        const coinId = req.coinId
        const payoutSettings = await PayoutServices.getPayoutSettings(coinId)
        return res.json(successResponse(payoutSettings))
    } catch (error) {
        return res.status(500).json(errorResponse(error.message))
    }
}

// Controller for updating payout settings
exports.updatePayoutSettingsController = async (req, res) => {
    try {
        const coinId = req.coinId
        const { minimumBalance } = req.body
        const updatedPayoutSettings = await PayoutServices.updatePayoutSettings(minimumBalance, coinId)
        return res.json(successResponse(updatedPayoutSettings, 'Payout updated successfully!'));
    } catch (error) {
        return res.status(500).json(errorResponse(error.message));
    }
};

// Controller for creating a payout request
exports.createPayoutRequestController = async (req, res) => {
    try {
        const { userId } = req.body
        const coinId = req.coinId
        await PayoutServices.createPayoutRequest(userId, coinId);
        return res.json(successResponse(null, 'Request created successfully'));
    } catch (error) {
        return res.status(500).json(errorResponse(error.message));
    }
};

// Controller for getting all payout requests
exports.getAllPayoutRequestsController = async (req, res) => {
    try {
        const requests = await PayoutServices.getAllPayoutRequests(req)
        return res.json(successResponse(requests));
    } catch (error) {
        return res.status(error.statusCode || 500).json(errorResponse(error.message || 'Internal server error'));
    }
};

// Controller for creating payout requests from balance
exports.createPayoutRequestFromBalanceController = async (req, res) => {
    try {
        const result = await PayoutServices.createPayoutRequestFromBalance(req);
        return res.json(successResponse({ message: 'Payout requests processed successfully.', data: result }));
    } catch (error) {
        return res.status(500).json(errorResponse(error.message));
    }
};