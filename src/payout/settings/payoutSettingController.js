const { getPayoutSettings, updatePayoutSettings } = require('./payoutService');
const { successResponse, errorResponse } = require('../../../utils/apiResponse');

exports.index = async (req, res) => {
    try {
        const payoutSettings = await getPayoutSettings();
        return res.status(200).json(successResponse({ data: payoutSettings }));
    } catch (error) {
        return res.status(500).json(errorResponse('Internal server error'));
    }
};

exports.payoutUpdate = async (req, res) => {
    const { minimumBalance } = req.body;
    try {
        const payoutSetting = await updatePayoutSettings(minimumBalance);
        return res.status(200).json(successResponse({ data: payoutSetting, message: 'Minimum payout updated successfully' }));
    } catch (error) {
        return res.status(500).json(errorResponse('Internal server error'));
    }
};
