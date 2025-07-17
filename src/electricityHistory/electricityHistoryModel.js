const mongoose = require('mongoose');
const { Schema } = mongoose;

const electricityHistorySchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    previousElectricity: {
        type: Number,
        required: true,
    },
    recordedAt: {
        type: Date,
        default: Date.now,
    }
}, {
    timestamps: true
});

const ElectricityHistory = mongoose.model('ElectricityHistory', electricityHistorySchema);
module.exports = ElectricityHistory;
