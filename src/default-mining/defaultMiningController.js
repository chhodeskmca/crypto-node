const DefaultMining = require('./defaultMiningModel'); // Adjust the path as necessary

async function updateDefaultMining(req, res) {
    const { minimum, maximum, electricityExchange } = req.body

    try {
        await DefaultMining.updateOne(
            {}, // Empty filter to match the first document
            { $set: { minimum, maximum, electricityExchange } },
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
        const defaultMining = await DefaultMining.findOne()

        if (!defaultMining)
            return res.status(404).json({ error: 'Default rates not found.' })

        return res.status(200).json({ status: true, data: defaultMining })

    } catch (error) {
        res.status(500).json({ error: 'Oops.. Something went wrong. Please try again later.' })
    }
}

module.exports = {
    updateDefaultMining,
    getDefaultMining
};
