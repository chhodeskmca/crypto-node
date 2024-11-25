const User = require('../users/userModel')
const Balance = require('../balance/balanceModel')
const PayoutSetting = require('../payout/settings/payoutSettingModel')
const Mining = require('./miningModel')
const MiningUtils = require('../../utils/miningUtils')
const mongoose = require('mongoose');
const { ObjectId } = mongoose.Types;
const { successResponse, errorResponse } = require('../../utils/apiResponse')
const DefaultMining = require('../default-mining/defaultMiningModel')
const Coin = require('../coins/coinModel')

const miningInstance = new MiningUtils()

// Utility function to convert strings to numbers
function convertStringToNumber(string) {
    if (!string) return 0
    const number = parseFloat(string.toFixed(6))
    if (isNaN(number)) {
        throw new Error(`Unable to convert "${string}" to a number.`)
    }
    return parseFloat(number.toFixed(6))
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
    const coinId = req.coinId
    const { userId } = req.body

    const coin = await Coin.findById(coinId)

    const aggregation = [
        {
            $match: { _id: new ObjectId(userId) }
        },
        {
            $lookup: {
                from: 'balances',
                let: { userId: '$_id', coinId: new ObjectId(coinId) },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $and: [
                                    { $eq: ['$userId', '$$userId'] },
                                    { $eq: ['$coinId', '$$coinId'] }
                                ]
                            }
                        }
                    }
                ],
                as: 'userBalance'
            }
        },
        {
            $lookup: {
                from: 'minings',
                let: { userId: '$_id', coinId: new ObjectId(coinId) },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $and: [
                                    { $eq: ['$userId', '$$userId'] },
                                    { $eq: ['$coinId', '$$coinId'] }
                                ]
                            }
                        }
                    }
                ],
                as: 'userMining'
            }
        },
        {
            $addFields: {
                userBalance: { $arrayElemAt: ['$userBalance', 0] },
                userMining: { $arrayElemAt: ['$userMining', 0] }
            }
        }
    ]

    // Execute the aggregation
    const users = await User.aggregate(aggregation)

    if (!users.length) {
        throw new Error('User not found')
    }


    const user = users[0]
    const miningSettings = user?.userMining?.settings
    const kaspa = convertStringToNumber(user.userBalance?.kaspa) || 0
    const electricityExchange = miningSettings?.electricityExchange || coin?.settings?.electricityExchange

    const response = await miningInstance.getDefaultMiningData(
        {
            'orderedHashRate': miningSettings?.orderedHashrate,
            'defaultMining': coin?.settings?.mining
        }
    )

    const calculateMiningResponse = await miningInstance.calculateMiningEarnings(user?.userMining, kaspa)

    const data = {
        minPayout: convertStringToNumber(miningSettings?.minPayoutAmount) || 0,
        kaspa: kaspa,
        minute: convertStringToNumber(response.coins),
        minEarning: response.dollars,
        currentDollarPrice: response.price,
        orderedHashRate: convertStringToNumber(miningSettings?.orderedHashrate) || 0,
        electricitySpendings: convertStringToNumber(user.userBalance?.electricity) || 0,
        electricityExchange: electricityExchange,
        ...calculateMiningResponse
    }

    return { data, message: 'Earnings fetched successfully.', status: true }
}

// Service function for getting current hash rate
exports.minePerMinute = async () => {
    const minings = await Mining.aggregate([
        {
            $match: {
                "settings.orderedHashrate": {
                    $ne: 0
                }
            }
        },
        {
            $lookup: {
                from: "coins",
                localField: "coinId",
                foreignField: "_id",
                as: "coin"
            }
        },
        {
            $unwind: {
                path: "$coin",
                preserveNullAndEmptyArrays: true
            }
        },
        {
            $addFields: {
                coinSettings: "$coin.settings"
            }
        },
        {
            $project: {
                coin: 0
            }
        }
    ])

    await Promise.all(minings.map(async (mining) => {
        const miningSettings = mining.settings
        const coinSettings = mining.coinSettings

        if (!miningSettings || !coinSettings) return

        const latestElectricity = convertStringToNumber(miningSettings.electricitySpendings) / 60

        if (miningSettings.orderedHashrate) {

            const response = await miningInstance.getDefaultMiningData(
                {
                    'orderedHashRate': miningSettings.orderedHashrate,
                    'defaultMining': coinSettings.mining
                }
            )

            if (response) {
                const modifiedUser = miningInstance.addMiningKaspaToUserArray(mining, response.coins)

                const miningUpdateFields = {
                    minsCount: modifiedUser.minsCount,
                    hour: modifiedUser.hour,
                    earnings: modifiedUser.earnings
                }

                await Mining.updateOne({ '_id': mining._id }, { $set: miningUpdateFields }, { upsert: true })

                const balanceQuery = {
                    'userId': mining.userId,
                    'coinId': mining.coinId
                }

                const userBalance = await Balance.findOne(balanceQuery)

                const latestKaspa = convertStringToNumber((modifiedUser.hour).slice(-1)[0])

                if (userBalance) {
                    const newKaspaBalance = convertStringToNumber(userBalance.kaspa) + latestKaspa
                    const newElectricityBalance = convertStringToNumber(userBalance.electricity) + latestElectricity

                    await Balance.updateOne(
                        balanceQuery,
                        {
                            kaspa: convertStringToNumber(newKaspaBalance),
                            electricity: convertStringToNumber(newElectricityBalance)
                        }
                    )
                } else {
                    await Balance.create({
                        ...balanceQuery,
                        kaspa: latestKaspa,
                        electricity: latestElectricity
                    })
                }
            }
        }
    }))

    return successResponse(null, 'Hash rate updated successfully')
}