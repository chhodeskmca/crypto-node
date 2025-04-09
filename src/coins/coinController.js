const {
    getAllCoinsService,
    getCoinByIdService,
    createCoinService,
    updateCoinService,
    deleteCoinService,
    assignCoinToUserService,
    getCoinByUserIdService
} = require('./coinService')
const Coin = require("./coinModel")
// Controller for getting all coins
const getAllCoins = async (req, res) => {
    try {
        const coins = await getAllCoinsService()
        res.status(200).json(coins)
    } catch (error) {
        res.status(500).json({ message: 'Error fetching coins', error })
    }
}

// Controller for getting a coin by ID
const getCoinById = async (req, res) => {
    const { id } = req.params
    try {
        const coin = await getCoinByIdService(id)
        if (!coin) {
            return res.status(404).json({ message: 'Coin not found' })
        }
        res.status(200).json(coin)
    } catch (error) {
        res.status(500).json({ message: 'Error fetching coin', error })
    }
}

// Controller for getting a coin by ID
const getCoinByUserId = async (req, res) => {
    const { userId } = req.params
    try {
        const coin = await getCoinByUserIdService(userId)
        if (!coin) {
            return res.status(404).json({ message: 'Coin not found' })
        }
        res.status(200).json(coin)
    } catch (error) {
        res.status(500).json({ message: 'Error fetching coin', error })
    }
}

// Controller for getting a coin by ID
const assignCoinToUser = async (req, res) => {
    try {
        const coin = await assignCoinToUserService(req)
        if (!coin) {
            return res.status(404).json({ message: 'Coin not found' })
        }
        res.status(200).json(coin)
    } catch (error) {
        res.status(500).json({ message: 'Error assigning coin', error })
    }
}

// Controller for creating a new coin
const createCoin = async (req, res) => {
    try {
        req.body.imagePath = req.file ? req.file.path.replace('public/', '') : null
        const coin = await createCoinService(req.body)
        res.status(200).json(coin)
    } catch (error) {
        res.status(500).json({ message: 'Error creating coin', error })
    }
}

// Controller for updating a coin
const updateCoin = async (req, res) => {
    const { id } = req.params
    const { name, symbol, price, color } = req.body
    // const imagePath = req.file ? req.file.path : null // Handle image path if uploaded
    const imagePath = req?.file && req?.file?.path.replace('public/', '')
    try {
        const existingCoin = await Coin.findOne({ name, _id: { $ne: id } })

        if (existingCoin) {
            return res.status(400).json({ message: `Coin with the name "${name}" already exists` })
        }

        const updatedCoin = await updateCoinService(id, { name, symbol, price, color, imagePath })
        if (!updatedCoin) {
            return res.status(404).json({ message: 'Coin not found' })
        }
        res.status(200).json({ message: 'Coin updated successfully', updatedCoin, status: true })
    } catch (error) {
        res.status(500).json({ message: 'Error updating coin', error })
    }
}

// Controller for deleting a coin
const deleteCoin = async (req, res) => {
    const { id } = req.params
    try {
        const deletedCoin = await deleteCoinService(id)
        if (!deletedCoin) {
            return res.status(404).json({ message: 'Coin not found' })
        }
        res.status(200).json({ message: 'Coin deleted successfully' })
    } catch (error) {
        res.status(500).json({ message: 'Error deleting coin', error })
    }
}

module.exports = {
    getAllCoins,
    getCoinById,
    createCoin,
    updateCoin,
    deleteCoin,
    assignCoinToUser,
    getCoinByUserId
}