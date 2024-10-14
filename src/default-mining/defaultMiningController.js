const DefaultMining = require('./defaultMiningModel'); // Adjust the path as necessary

async function updateDefaultMining(req, res) {
    const { minimum, maximum } = req.body

    try {
        await DefaultMining.updateOne(
            { _id: '66d80de45059596f8f918949' },
            { $set: { minimum, maximum } },
            { upsert: true }
        )

        res.status(200).json({
            status: true,
            message: "Default mining settings updated successfully."
        })

        return
    } catch (error) {
        res.status(500).json({ error: 'Oops.. Something went wrong. Please try again later.' })
    }
}

async function getDefaultMining(req, res) {
    try {
        const defaultMining = await DefaultMining.findOne({ _id: '66d80de45059596f8f918949' })

        if (!defaultMining)
            return res.status(404).json({ error: 'Default mining settings not found.' })

        return res.status(200).json({ status: true, data: defaultMining })

    } catch (error) {
        res.status(500).json({ error: 'Oops.. Something went wrong. Please try again later.' })
    }
}

module.exports = {
    updateDefaultMining,
    getDefaultMining
};
