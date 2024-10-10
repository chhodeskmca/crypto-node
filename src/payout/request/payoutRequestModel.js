const mongoose = require('mongoose');

const PayoutRequestSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    status: { type: String, enum: ['pending', 'completed', 'failed'], default: 'pending' },
}, {
    timestamps: true,
});

const PayoutRequest = mongoose.model('PayoutRequest', PayoutRequestSchema);

module.exports = PayoutRequest;
