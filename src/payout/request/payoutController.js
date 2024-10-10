const PayoutServices = require('./payoutService')
const { validationResult } = require('express-validator')
const { successResponse, errorResponse } = require('../../../utils/apiResponse')


// Controller for fetching payout settings
exports.getPayoutSettingsController = async (req, res) => {
    try {
        const payoutSettings = await PayoutServices.getPayoutSettings()
        return res.json(successResponse(payoutSettings))
    } catch (error) {
        return res.status(500).json(errorResponse(error.message))
    }
}

// Controller for updating payout settings
exports.updatePayoutSettingsController = async (req, res) => {
    try {
        const { minimumBalance } = req.body;
        const updatedPayoutSettings = await PayoutServices.updatePayoutSettings(minimumBalance);
        return res.json(successResponse(updatedPayoutSettings));
    } catch (error) {
        return res.status(500).json(errorResponse(error.message));
    }
};

// Controller for creating a payout request
exports.createPayoutRequestController = async (req, res) => {
    try {
        const { userId } = req.body
        await PayoutServices.createPayoutRequest(userId);
        return res.json(successResponse(null, 'Request created successfully'));
    } catch (error) {
        return res.status(500).json(errorResponse(error.message));
    }
};

// Controller for getting all payout requests
exports.getAllPayoutRequestsController = async (req, res) => {
    try {
        const requests = await PayoutServices.getAllPayoutRequests();
        return res.json(successResponse(requests));
    } catch (error) {
        return res.status(500).json(errorResponse('Internal server error'));
    }
};

// Controller for creating payout requests from balance
exports.createPayoutRequestFromBalanceController = async (req, res) => {
    try {
        const result = await PayoutServices.createPayoutRequestFromBalance();
        return res.json(successResponse({ message: 'Payout requests processed successfully.', data: result }));
    } catch (error) {
        return res.status(500).json(errorResponse(error.message));
    }
};