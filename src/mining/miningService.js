const User = require('../users/userModel')
const Balance = require('../balance/balanceModel')
const PayoutSetting = require('../payout/settings/payoutSettingModel')
const Mining = require('./miningModel')
const MiningUtils = require('../../utils/miningUtils')
const mongoose = require('mongoose');
const { ObjectId } = mongoose.Types;
const { successResponse, errorResponse } = require('../../utils/apiResponse')
const DefaultMining = require('../default-mining/defaultMiningModel')
const DefaultExchangeRates = require('../default-rates/defaultExchangeModel')
const moment = require('moment')

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
    const kaspa = convertStringToNumber(user.userBalance?.kaspa) || 0

    const minPayout = await PayoutSetting.findOne()
    const electricityExchange = await DefaultMining.findOne()

    const currentPrice = (await DefaultExchangeRates.findOne())?.usd || 0

    const response = await miningInstance.getDefaultMiningData(user.orderedHashrate, currentPrice)

    const calculateMiningResponse = await miningInstance.calculateMiningEarnings(user?.userMining, kaspa)

    const data = {
        minPayout: convertStringToNumber(minPayout?.minimumBalance) || 0,
        balance: 0,
        kaspa: kaspa,
        minute: convertStringToNumber(response.coins),
        minEarning: response.dollars,
        currentDollarPrice: response.price,
        orderedHashRate: convertStringToNumber(user?.orderedHashrate) || 0,
        electricitySpendings: convertStringToNumber(user.userBalance?.electricity) || 0,
        electricityExchange: user?.electricityExchange || electricityExchange?.electricityExchange,
        ...calculateMiningResponse
    }

    return { data, message: 'Earnings fetched successfully.', status: true }
}

// Lock to prevent overlapping executions
let isMiningInProgress = false

// Service function for getting current hash rate
const processBatch = async (skip, batchSize, currentPrice) => {
    try {
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
            },
            { $skip: skip },
            { $limit: batchSize }
        ])

        if (!users.length) {
            return { processed: 0, errors: 0 }
        }

        console.log(`Processing batch: ${skip + 1} to ${skip + users.length}`)

        let processed = 0
        let errors = 0

        await Promise.all(users.map(async (user) => {
            try {
                const latestElectricity = convertStringToNumber(user.electricitySpendings) / 60

                if (user.userMining && user.orderedHashrate) {
                    const response = await miningInstance.getDefaultMiningData(user.orderedHashrate, currentPrice)


                    if (response) {
                        const modifiedUser = miningInstance.addMiningKaspaToUserArray(user.userMining, response.coins)

                        const miningUpdateFields = {
                            minsCount: modifiedUser.minsCount,
                            hour: modifiedUser.hour,
                            earnings: modifiedUser.earnings
                        }

                        await Mining.updateOne({ userId: user._id }, { $set: miningUpdateFields }, { upsert: true })

                        const userBalance = await Balance.findOne({ userId: user._id })
                        const latestKaspa = convertStringToNumber((modifiedUser.hour).slice(-1)[0])

                        if (userBalance) {
                            const newKaspaBalance = convertStringToNumber(userBalance.kaspa) + latestKaspa
                            const newElectricityBalance = convertStringToNumber(userBalance.electricity) + latestElectricity

                            await Balance.updateOne(
                                { userId: user._id },
                                {
                                    balance: 0,
                                    kaspa: convertStringToNumber(newKaspaBalance),
                                    electricity: convertStringToNumber(newElectricityBalance)
                                }
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

                    processed++
                }
            } catch (error) {
                console.error(`Error processing user ${user._id}:`, error.message)
                errors++
            }
        }))
        return { processed, errors }
    } catch (error) {
        console.error(`Batch processing error (skip: ${skip}):`, error.message)
        return { processed: 0, errors: batchSize }
    }
}

// Service function for getting current hash rate
exports.minePerMinute = async () => {
    const startTime = Date.now()

    // Prevent overlapping executions
    if (isMiningInProgress) {
        console.log(`⚠️ Mining already in progress, skipping`)
        return successResponse(null, 'Mining already in progress')
    }

    isMiningInProgress = true

    try {
        console.log(`Mining started at ${moment().format('YYYY-MM-DD HH:mm:ss ZZ')}`)
        // Get total count of users to process
        const totalUsers = await User.countDocuments({
            $or: [
                { isAdmin: false },
                { isAdmin: "0" },
                { isAdmin: { $exists: false } }
            ]
        })

        if (totalUsers === 0) {
            console.log('No users found to process')
            return successResponse(null, 'No users to process')
        }

        console.log(`Total users to process: ${totalUsers}`)

        // Get current price once for all batches
        const { price: currentPrice } = await miningInstance.getCurrentKaspaPrice()

        // Update exchange rate
        await DefaultExchangeRates.updateOne({}, { usd: currentPrice }, { upsert: true })

        const BATCH_SIZE = 50
        const totalBatches = Math.ceil(totalUsers / BATCH_SIZE)
        console.log(`Processing ${totalBatches} batches of ${BATCH_SIZE} users each`)

        // Create batch promises - process multiple batches in parallel
        const MAX_PARALLEL_BATCHES = 10 // Limit concurrent batches to avoid overwhelming DB
        const batchPromises = []

        for (let i = 0; i < totalBatches; i += MAX_PARALLEL_BATCHES) {
            const currentBatchGroup = []

            // Create batch group (up to MAX_PARALLEL_BATCHES batches)
            for (let j = i; j < Math.min(i + MAX_PARALLEL_BATCHES, totalBatches); j++) {
                const skip = j * BATCH_SIZE
                currentBatchGroup.push(processBatch(skip, BATCH_SIZE, currentPrice))
            }

            // Process this group of batches in parallel
            const groupResults = await Promise.all(currentBatchGroup)

            // Log progress
            const groupEnd = Math.min(i + MAX_PARALLEL_BATCHES, totalBatches)
            console.log(`Completed batch group ${i + 1}-${groupEnd} of ${totalBatches}`)

            batchPromises.push(...groupResults)
        }

        // Calculate totals
        const totalProcessed = batchPromises.reduce((sum, result) => sum + result.processed, 0)
        const totalErrors = batchPromises.reduce((sum, result) => sum + result.errors, 0)

        const endTime = Date.now()
        const executionTime = endTime - startTime

        console.log(`✅ Mining completed in ${executionTime}ms`)
        console.log(`📊 Processed: ${totalProcessed} users, Errors: ${totalErrors}`)

        return successResponse(null, `Hash rate updated successfully for ${totalProcessed} users in ${executionTime}ms`)

    } catch (error) {
        const endTime = Date.now()
        const executionTime = endTime - startTime
        console.error(`❌ Critical error after ${executionTime}ms:`, error.message)
        return errorResponse(error.message, 'Mining process failed')
    } finally {
        isMiningInProgress = false
    }
}