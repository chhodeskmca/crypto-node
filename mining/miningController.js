const User = require('../users/userModel');
const Balance = require('../src/balance/balanceModel.js');
const PayoutSetting = require('../payout/payoutSettingModel');
const Mining = require('../mining/miningModel');
const { fetchPerMinuteKaspaMining, getDayKaspaMining2, addMiningKaspaToUserArray, calculateMining } = require('../../utils/miningUtils');
const { successResponse, errorResponse } = require('../../utils/apiResponse');
const MiningUtils = require('../../utils/miningUtils.js');

const miningInstance = new MiningUtils();

async function callAPI(currentHashRate) {
    try {
        const earningPerMinute = await miningInstance.fetchPerMinuteKaspaMining(currentHashRate);
        return earningPerMinute;
    } catch (error) {
        throw new Error('Error fetching earnings');
    }
}

function convertStringToNumber(string) {
    const number = parseFloat(string);
    if (isNaN(number)) {
        throw new Error(`Unable to convert "${string}" to a number.`);
    }
    return parseFloat(number.toFixed(14));
}

async function getCurrentHashRate(req, res) {
    try {
        // Fetch all users with userMining populated
        const users = await User.find().populate('userMining');

        for (const user of users) {
            const latestElectricity = convertStringToNumber(user.electricitySpendings) / 60;

            if (user.userMining) {
                const response = await miningInstance.getDefaultKaspaMining(user.orderedHashrate);
                if (response) {
                    const modifiedUser = miningInstance.addMiningKaspaToUserArray(user.userMining, response.coins, response.dollars);

                
                   const miningUpdateFields = {
                        minsCount: modifiedUser.minsCount,
                        hoursCount: modifiedUser.hoursCount,
                        daysCount: modifiedUser.daysCount,
                        weekCount: modifiedUser.weekCount,
                        hour: modifiedUser.hour,
                        day: modifiedUser.day,
                        week: modifiedUser.week,
                        month: modifiedUser.month,
                        hourEarning: modifiedUser.hourEarning,
                        dayEarning: modifiedUser.dayEarning,
                        weekEarning: modifiedUser.weekEarning,
                        monthEarning: modifiedUser.monthEarning
                    };
                    await Mining.updateOne(
                        { userId: user._id },
                        { $set: miningUpdateFields },
                        { upsert: true }
                    );
                
                    const userBalance = await Balance.findOne({ userId: user._id });
                    const hoursBalance = JSON.parse(modifiedUser.hourEarning);
                    const hoursKaspaBalance = JSON.parse(modifiedUser.hour);
                    const latestPrice = convertStringToNumber(hoursBalance[hoursBalance.length - 1]);
                    const latestKaspa = convertStringToNumber(hoursKaspaBalance[hoursKaspaBalance.length - 1]);

                    if (userBalance) {
                        const newBalance = convertStringToNumber(userBalance.balance) + latestPrice;
                        const newKaspaBalance = convertStringToNumber(userBalance.kaspa) + latestKaspa;
                        const newElectricityBalance = convertStringToNumber(userBalance.electricity) + latestElectricity;

                        await Balance.updateOne(
                            { userId: user._id },
                            { balance: newBalance, kaspa: newKaspaBalance, electricity: newElectricityBalance }
                        );
                    } else {
                        await Balance.create({
                            userId: user._id,
                            balance: latestPrice,
                            kaspa: latestKaspa,
                            electricity: latestElectricity
                        });
                    }
                }
            }
        }

        res.status(200).json(successResponse(null, 'Hash rate updated successfully'));
    } catch (error) {
        res.status(500).json(errorResponse(`Error updating hash rate: ${error.message}`));
    }
}

async function getUserEarnings(req, res) {
    try {
        const { userId } = req.body;
        const user = await User.findById(userId).populate('userMining').populate('userBalance');
        if (!user) {
            throw errorResponse('User not found', 404);
        }
        const minPayout = await PayoutSetting.findOne();
        const response = await callAPI(user.orderedHashrate);
        const orderedHashRate = user.orderedHashrate;
        if (user.userMining) {
            // Ensure miningInstance is instantiated properly
            const miningInstance = new MiningUtils();
            const data = miningInstance.calculateMining(user.userMining);

            data.minPayout = convertStringToNumber(minPayout.minimumBalance);
            data.balance = convertStringToNumber(user.userBalance.balance);
            data.kaspa = convertStringToNumber(user.userBalance.kaspa);
            data.minute = response.coins;
            data.minEarning = response.dollars;
            data.currentDollarPrice = response.price;
            data.orderedHashRate = convertStringToNumber(orderedHashRate);
            data.electricitySpendings = convertStringToNumber(user.userBalance.electricity);
            return res.status(200).json({
                data: data,
                message: 'Earnings fetched successfully.',
                status: true
            });
            // return successResponse(data);
        } else {
            throw errorResponse('Error while processing earnings', 404);
        }
    } catch (error) {
        console.error(`Error fetching user earnings: ${error.message}`);
        throw new Error(`Error fetching user earnings: ${error.message}`);
    }
}

module.exports = {
    getUserEarnings,
    getCurrentHashRate
};
