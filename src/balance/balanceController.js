const Balance = require('../balance/balanceModel');
const ElectricityHistory = require('../electricityHistory/electricityHistoryModel');

exports.updateUserElectricity = async (req, res) => {
    const { userId, newElectricity } = req.body;

    try {
        const balance = await Balance.findOne({ userId });

        if (!balance) {
            return res.status(404).json({ status: false, message: 'Balance not found' });
        }
        let historyDoc = await ElectricityHistory.findOne({ userId });

        if (!historyDoc) {
            historyDoc = new ElectricityHistory({ userId, history: [] });
        }

        historyDoc.history.unshift({
            value: balance.electricity,
            timestamp: new Date()
        });

        if (historyDoc.history.length > 30) {
            historyDoc.history = historyDoc.history.slice(0, 30);
        }

        await historyDoc.save();

        balance.electricity = newElectricity;
        await balance.save();

        res.json({ status: true, message: 'Electricity updated successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: false, message: 'Server error' });
    }
};
