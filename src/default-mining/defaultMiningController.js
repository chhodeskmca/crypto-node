const Coin = require('../coins/coinModel');
const DefaultMining = require('./defaultMiningModel'); // Adjust the path as necessary

async function updateDefaultMining(req, res) {
    const coinId = req.coinId
    const { minimum, maximum, electricityExchange } = req.body

    try {
        await Coin.updateOne(
            { _id: coinId }, // Empty filter to match the first document
            {
                $set: {
                    'settings.electricityExchange': electricityExchange,
                    'settings.mining.min': minimum,
                    'settings.mining.max': maximum,
                }
            },
            { upsert: true } // Ensure it creates a document if none exist
        )

        res.status(200).json({
            status: true,
            message: "Default rates updated successfully."
        })
    } catch (error) {
        console.error("Error updating default rates:", error) // Log error for debugging
        res.status(500).json({ error: 'Oops.. Something went wrong. Please try again later.' })
    }
}

async function getDefaultMining(req, res) {
    try {
        const coinId = req.coinId
        const coin = await Coin.findOne({ _id: coinId }).select('settings')

        if (!coin)
            return res.status(404).json({ error: 'Default rates not found.' })

        return res.status(200).json({ status: true, data: coin })

    } catch (error) {
        res.status(500).json({ error: 'Oops.. Something went wrong. Please try again later.' })
    }
}

module.exports = {
    updateDefaultMining,
    getDefaultMining
};
