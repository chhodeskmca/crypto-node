const mongoose = require('mongoose');

const historyEntrySchema = new mongoose.Schema({
    value: { type: String, required: true },
    timestamp: { type: Date, default: Date.now }
});

const electricityHistorySchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    history: [historyEntrySchema]
});

const balanceHistorySchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    history: [historyEntrySchema]
});


const ElectricityHistory = mongoose.model('ElectricityHistory', electricityHistorySchema);
const BalanceHistory = mongoose.model('BalanceHistory', balanceHistorySchema);

module.exports = { ElectricityHistory, BalanceHistory };
