const mongoose = require('mongoose');

const electricityHistorySchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    history: [
        {
            value: { type: String, required: true },
            timestamp: { type: Date, default: Date.now }
        }
    ]
});


const ElectricityHistory = mongoose.model('ElectricityHistory', electricityHistorySchema);
module.exports = ElectricityHistory;
