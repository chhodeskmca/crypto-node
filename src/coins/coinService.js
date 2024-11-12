// Assuming you have a Coin model

const { successResponse, errorResponse } = require("../../utils/apiResponse");
const Coin = require("./coinModel");

// Service for getting all coins
const getAllCoinsService = async () => {
    const coins = await Coin.find()

    return successResponse(coins, 'Coins get successfully')
};

// Service for getting a coin by ID
const getCoinByIdService = async (id) => {
    return await Coin.findById(id); // Fetch coin by ID
};

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

// Service for updating a coin
const updateCoinService = async (id, { name, symbol, price, imagePath }) => {
    return await Coin.findByIdAndUpdate(id, { name, symbol, price, imagePath }, { new: true }); // Update the coin and return the updated document
};

// Service for deleting a coin
const deleteCoinService = async (id) => {
    return await Coin.findByIdAndDelete(id); // Delete the coin by ID
};

module.exports = {
    getAllCoinsService,
    getCoinByIdService,
    createCoinService,
    updateCoinService,
    deleteCoinService
};