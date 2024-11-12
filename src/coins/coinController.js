const {
    getAllCoinsService,
    getCoinByIdService,
    createCoinService,
    updateCoinService,
    deleteCoinService
} = require('./coinService')

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
    const { name, symbol, price } = req.body
    const imagePath = req.file ? req.file.path : null // Handle image path if uploaded

    try {
        const updatedCoin = await updateCoinService(id, { name, symbol, price, imagePath })
        if (!updatedCoin) {
            return res.status(404).json({ message: 'Coin not found' })
        }
        res.status(200).json({ message: 'Coin updated successfully', updatedCoin })
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
    deleteCoin
}