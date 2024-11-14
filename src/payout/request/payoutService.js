const PayoutRequest = require('./payoutRequestModel');
const PayoutSetting = require('../settings/payoutSettingModel');
const User = require('../../users/userModel');
const Balance = require('../../balance/balanceModel');
const { sendPayoutRequestMail } = require('../../../utils/emailService');
const MiningUtils = require('../../../utils/miningUtils')
const mongoose = require('mongoose');
const { customError } = require('../../../utils/helper');
const { ROLE_TYPES } = require('../../../config');
const { ObjectId } = mongoose.Types;

// Instantiate the Mining class
const miningInstance = new MiningUtils();

// Service function for fetching payout settings
exports.getPayoutSettings = async (coinId) => {
    try {
        return await PayoutSetting.findOne({ coinId });
    } catch (error) {
        throw new Error('Error fetching payout settings');
    }
};

// Service function for updating payout settings
exports.updatePayoutSettings = async (minimumBalance, coinId) => {
    try {
        const payoutSetting = await PayoutSetting.findOneAndUpdate(
            { coinId },
            { minimumBalance },
            { new: true, upsert: true }
        );
        return payoutSetting;
    } catch (error) {
        throw new Error('Error updating payout settings');
    }
};

// Service function for creating a payout request
exports.createPayoutRequest = async (userId, coinId) => {
    try {
        const existingRequest = await PayoutRequest.findOne({ userId, coinId, status: 'pending' });
        if (existingRequest) {
            throw new Error('You have already requested a payout');
        }

        const userBalance = await Balance.findOne({ userId }).exec();
        if (!userBalance) {
            throw new Error('User balance not found');
        }

        await PayoutRequest.create({
            userId: new ObjectId(userId),
            status: 'pending'
        })

        return { message: 'Payout request created successfully!' }
        // if (payoutRequest) {
        //     const user = await User.findById(userId);
        //     if (user) {
        //         const data = { content: user.name, type: 'single' };
        //         await sendPayoutRequestMail(data);
        //     }
        //     return payoutRequest;
        // } else {
        //     throw new Error('Request was not created');
        // }
    } catch (error) {
        throw new Error(error.message);
    }
};

// Service function for creating payout requests based on user balance
exports.createPayoutRequestFromBalance = async (req) => {
    try {
        const coinId = req.coinId
        let isAnyPayoutRequest = false
        const payoutSetting = await PayoutSetting.findOne().lean();
        const adminMinimumBalance = payoutSetting ? payoutSetting.minimumBalance : 0;

        const balances = await Balance.find({ kaspa: { $gt: adminMinimumBalance } }).lean().exec();

        for (const balance of balances) {
            const userId = balance.userId;

            const existingRequest = await PayoutRequest.findOne({ userId, status: 'pending' });
            const validRequest = await User.findOne({ _id: userId, minPayoutAmount: { $gte: adminMinimumBalance } }).lean().exec();

            if (!existingRequest && validRequest) {
                isAnyPayoutRequest = true;
                await PayoutRequest.create({ userId, coinId: new ObjectId(coinId) });
            }
        }

        if (isAnyPayoutRequest) {
            const data = { content: 'some users', type: 'cron' };
            await sendPayoutRequestMail(data);
        }

        return { message: 'Payout requests created successfully.' };
    } catch (error) {
        throw new Error('Error creating payout requests from balance');
    }
};

// Service function for getting all pending payout requests
exports.getAllPayoutRequests = async (req) => {
    const userId = req.userId
    const coinId = req.coinId
    const accessType = req.accessType

    let aggregation = [
        {
            $match: {
                status: 'pending',
                coinId: coinId
            }
        },
        {
            $lookup: {
                from: 'users',
                localField: 'userId',
                foreignField: '_id',
                as: 'get_user',
            },
        },
        {
            $lookup: {
                from: 'balances',
                localField: 'userId',
                foreignField: 'userId',
                as: 'get_user_balance',
            },
        },
        {
            $unwind: {
                path: '$get_user',
                preserveNullAndEmptyArrays: true
            }
        },
        {
            $unwind: {
                path: '$get_user_balance',
                preserveNullAndEmptyArrays: true
            }
        },
        {
            $match: {
                'get_user.createdBy': new ObjectId(userId)
            }
        }
    ]

    if (accessType === ROLE_TYPES.SUPER_ADMIN) {
        aggregation.pop()
    }

    try {
        const requests = await PayoutRequest.aggregate([...aggregation])

        if (!requests.length) {
            throw customError({ code: 404, message: 'No data found' })
        }

        const earningPerMinute = await miningInstance.getCurrentKaspaPrice();

        const updatedRequests = requests.map(request => ({
            ...request,
            amount: earningPerMinute
        }));

        return updatedRequests;
    } catch (error) {
        console.log('error:', error)
        throw error
    }
};