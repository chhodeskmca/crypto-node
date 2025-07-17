const Balance = require('../balance/balanceModel');
const ElectricityHistory = require('../electricityHistory/electricityHistoryModel');

exports.updateUserElectricity = async (req, res) => {
    const { userId, newElectricity } = req.body;

    try {
        const balance = await Balance.findOne({ userId });

        if (!balance) {
            return res.status(404).json({ status: false, message: 'Balance not found' });
        }

        // Store old electricity value into history
        const historyEntry = new ElectricityHistory({
            userId,
            previousElectricity: balance.electricity,
        });

        await historyEntry.save();

        // Update the electricity value
        balance.electricity = newElectricity;
        await balance.save();

        res.json({ status: true, message: 'Electricity updated successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: false, message: 'Server error' });
    }
};
