// Assuming you have a Coin model

const { default: mongoose } = require("mongoose")
const { successResponse, errorResponse } = require("../../utils/apiResponse")
const Balance = require("../balance/balanceModel")
const Mining = require("../mining/miningModel")
const PayoutSettingModel = require("../payout/settings/payoutSettingModel")
const Coin = require("./coinModel")
const { ObjectId } = require("../../config/db")

// Service for getting all coins
const getAllCoinsService = async () => {
    const coins = await Coin.find()

    return successResponse(coins, 'Coins get successfully')
}

// Service for getting a coin by ID
const getCoinByIdService = async (id) => {
    return await Coin.findById(id) // Fetch coin by ID
}

// Service for getting a coin by ID
const getCoinByUserIdService = async (userId) => {
    try {
        // Validate the userId
        if (!userId) {
            throw new Error('UserId is required')
        }

        const coins = await Mining.aggregate([
            {
                $match: { userId: new ObjectId(userId) }, // Match documents by userId
            },
            {
                $lookup: {
                    from: 'coins', // Name of the collection for `coinId`
                    localField: 'coinId', // Field in the current collection
                    foreignField: '_id', // Field in the foreign collection
                    as: 'coinData', // Alias for the joined data
                },
            },
            {
                $unwind: '$coinData', // Flatten the array of joined data
            },
            {
                $project: {
                    earnings: 0,
                    hour: 0
                },
            },
        ]);

        // Return a success response with the coins data
        return successResponse(coins)
    } catch (error) {
        // Handle errors gracefully and return an appropriate response
        return errorResponse(error.message || 'Failed to fetch coins')
    }
}

// Service for creating a new coin
const createCoinService = async ({ name, color, imagePath }) => {
    try {
        const existingCoin = await Coin.findOne({ name })
        if (existingCoin) {
            return errorResponse('Coin with this name already exists', 400)
        }

        const newCoin = new Coin({
            name,
            color,
            imagePath,
            settings: {
                electricityExchange: 0.00,
                mining: {
                    min: 0,
                    max: 0
                }
            }
        })

        const savedCoin = await newCoin.save()
        return successResponse(savedCoin, 'Coin created successfully')
    } catch (error) {
        throw error
    }
}

const getMinPayoutAmount = async (coinId) => {
    const payoutSettings = await PayoutSettingModel.findOne({ coinId })
    return payoutSettings ? payoutSettings.minimumBalance : 0
}

const assignCoinToUserService = async (req) => {
    try {
        const { coins = [], userId } = req.body

        // Validate userId format
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return errorResponse({ message: 'Invalid userId format.', statusCode: 400 })
        }

        // Extract and validate all coinIds
        const coinIds = coins.map((coin) => coin.coinId)
        for (const coinId of coinIds) {
            if (!mongoose.Types.ObjectId.isValid(coinId)) {
                return errorResponse({ message: `Invalid coinId: ${coinId}`, statusCode: 400 })
            }
        }

        // Fetch existing records for the user
        const existingRecords = await Mining.find({ userId })

        // Map existing records by coinId for quick lookup
        const existingMap = existingRecords.reduce((map, record) => {
            map[record.coinId.toString()] = record
            return map
        }, {})

        // Prepare for database operations
        const toInsert = []
        const toUpdate = []
        const incomingCoinIds = new Set(coinIds)

        // Handle incoming coins
        for (const coin of coins) {
            const { coinId, walletAddress, electricityExchange } = coin

            if (!mongoose.Types.ObjectId.isValid(coinId)) {
                return errorResponse({ message: `Invalid coinId detected: ${coinId}`, statusCode: 400 })
            }

            const minPayoutAmount = await getMinPayoutAmount(coinId)

            if (existingMap[coinId]) { // Update existing record
                toUpdate.push({
                    _id: existingMap[coinId]._id,
                    settings: {
                        ...existingMap[coinId].settings,
                        walletAddress,
                        electricityExchange,
                        minPayoutAmount
                    }
                })
            }
            else {   // Insert new record
                toInsert.push({
                    userId,
                    coinId,
                    settings: { walletAddress, electricityExchange, minPayoutAmount },
                    minsCount: 0,
                    hour: [],
                    earnings: []
                })
            }
        }

        // Find and delete extra records
        const toDelete = existingRecords.filter(
            (record) => !incomingCoinIds.has(record.coinId.toString())
        )

        // Perform database operations
        if (toUpdate.length) {
            await Promise.all(
                toUpdate.map((update) =>
                    Mining.findByIdAndUpdate(update._id, { $set: { settings: update.settings } })
                )
            )
        }

        if (toInsert.length) {
            await Mining.insertMany(toInsert)
        }

        if (toDelete.length) {
            await Mining.deleteMany({ _id: { $in: toDelete.map((record) => record._id) } })
        }

        return successResponse(null, 'Coins updated successfully.')
    } catch (error) {
        // Log the error for debugging
        console.error('Error in assignCoinToUserService:', error.message)

        if (error.name === 'CastError') {
            return errorResponse({
                message: `Invalid ${error.path}: ${error.value}`,
                statusCode: 400,
            })
        }

        throw error
    }
}

// Service for updating a coin
const updateCoinService = async (id, { name, symbol, price, imagePath }) => {
    return await Coin.findByIdAndUpdate(id, { name, symbol, price, imagePath }, { new: true }) // Update the coin and return the updated document
}

// Service for deleting a coin
const deleteCoinService = async (id) => {
    return await Coin.findByIdAndDelete(id) // Delete the coin by ID
}

module.exports = {
    getAllCoinsService,
    getCoinByIdService,
    createCoinService,
    updateCoinService,
    deleteCoinService,
    assignCoinToUserService,
    getCoinByUserIdService
}