const DefaultMining = require('./defaultMiningModel'); // Adjust the path as necessary

async function updateDefaultMining(req) {
    const { minimum, maximum } = req.body;

    try {
        const result = await DefaultMining.updateOne(
            { _id: '66d80de45059596f8f918949' }, // Query to find the document
            { $set: { minimum, maximum } }, // Update the document
            { upsert: true } // Create the document if it doesn't exist
        );

        return {
            status: true,
            message: "Default mining settings updated successfully."
        };
    } catch (error) {
        throw new Error('Oops.. Something went wrong. Please try again later.');
    }
};
async function getDefaultMining() {
    try {
        const defaultMining = await DefaultMining.findOne({ _id: '66d80de45059596f8f918949' });
        if (defaultMining) {
            return {
                status: true,
                data: defaultMining
            };
        } else {
            throw new Error('Default mining settings not found.');
        }
    } catch (error) {
        throw new Error('Oops.. Something went wrong. Please try again later.');
    }
}

module.exports = {
    updateDefaultMining,
    getDefaultMining
};
