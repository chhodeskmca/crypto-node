const User = require('../users/userModel')
const Balance = require('../balance/balanceModel')
const PayoutSetting = require('../payout/settings/payoutSettingModel')
const Mining = require('./miningModel')
const MiningUtils = require('../../utils/miningUtils')
const mongoose = require('mongoose');
const { ObjectId } = mongoose.Types;
const { successResponse, errorResponse } = require('../../utils/apiResponse')

const miningInstance = new MiningUtils()

// Utility function to convert strings to numbers
function convertStringToNumber(string) {
    if (!string) return 0
    const number = parseFloat(string.toFixed(3))
    if (isNaN(number)) {
        throw new Error(`Unable to convert "${string}" to a number.`)
    }
    return parseFloat(number.toFixed(14))
}


exports.updateDefaultMining = async (req) => {
    const { minimum, maximum } = req.body
    return { message: 'Default mining settings updated successfully.' }
}


exports.getDefaultMining = async () => {
    return { message: 'Default mining settings fetched successfully.' }
}

// Service function for getting user earnings
exports.getUserEarnings = async (req) => {
    const { userId } = req.body

    const aggregationPipeline = [
        {
            $match: { _id: new ObjectId(userId) }
        },
        {
            $lookup: {
                from: 'minings',
                localField: '_id',
                foreignField: 'userId',
                as: 'userMining'
            }
        },
        {
            $lookup: {
                from: 'balances',
                localField: '_id',
                foreignField: 'userId',
                as: 'userBalance'
            }
        },
        {
            $addFields: {
                userMining: { $arrayElemAt: ['$userMining', 0] },
                userBalance: { $arrayElemAt: ['$userBalance', 0] }
            }
        }
    ];

    // Execute the aggregation
    const users = await User.aggregate(aggregationPipeline);

    if (!users.length) {
        throw new Error('User not found')
    }

    const user = users[0]
    const minPayout = await PayoutSetting.findOne()
    const response = await miningInstance.getDefaultMiningData(user.orderedHashrate)
    const calculateMiningResponse = await miningInstance.calculateMiningEarnings(user?.userMining)

    const data = {
        minPayout: convertStringToNumber(minPayout?.minimumBalance) || 0,
        balance: convertStringToNumber(user.userBalance?.balance) || 0,
        kaspa: convertStringToNumber(user.userBalance?.kaspa) || 0,
        minute: convertStringToNumber(response.coins),
        minEarning: response.dollars,
        currentDollarPrice: response.price,
        orderedHashRate: convertStringToNumber(user?.orderedHashrate) || 0,
        electricitySpendings: convertStringToNumber(user.userBalance?.electricity) || 0,
        ...calculateMiningResponse
    }

    return { data, message: 'Earnings fetched successfully.', status: true }
}

// Service function for getting current hash rate
exports.getCurrentHashRate = async () => {
    const users = await User.aggregate([
        {
            $match: {
                $or: [
                    { isAdmin: false },
                    { isAdmin: "0" },
                    { isAdmin: { $exists: false } }
                ]
            }
        },
        {
            $lookup: {
                from: 'minings',
                localField: '_id',
                foreignField: 'userId',
                as: 'userMining'
            }
        },
        {
            $unwind: {
                path: '$userMining',
                preserveNullAndEmptyArrays: true
            }
        }
    ])



    await Promise.all(users.map(async (user) => {
        const latestElectricity = convertStringToNumber(user.electricitySpendings) / 60

        if (user.userMining) {
            const response = await miningInstance.getDefaultMiningData(user.orderedHashrate)

            if (response) {
                const modifiedUser = miningInstance.addMiningKaspaToUserArray(user.userMining, response.coins)

                const miningUpdateFields = {
                    minsCount: modifiedUser.minsCount,
                    hoursCount: modifiedUser.hoursCount,
                    daysCount: modifiedUser.daysCount,
                    weekCount: modifiedUser.weekCount,
                    hour: modifiedUser.hour,
                    day: modifiedUser.day,
                    week: modifiedUser.week,
                    month: modifiedUser.month
                }

                await Mining.updateOne({ userId: user._id }, { $set: miningUpdateFields }, { upsert: true })

                const userBalance = await Balance.findOne({ userId: user._id })
                const latestKaspa = convertStringToNumber((modifiedUser.hour).slice(-1)[0])

                if (userBalance) {
                    const newKaspaBalance = convertStringToNumber(userBalance.kaspa) + latestKaspa
                    const newElectricityBalance = convertStringToNumber(userBalance.electricity) + latestElectricity

                    await Balance.updateOne(
                        { userId: user._id },
                        { balance: 0, kaspa: newKaspaBalance, electricity: newElectricityBalance }
                    )
                } else {
                    await Balance.create({
                        userId: user._id,
                        balance: 0,
                        kaspa: latestKaspa,
                        electricity: latestElectricity
                    })
                }
            }
        }
    }))

    return successResponse(null, 'Hash rate updated successfully')
}