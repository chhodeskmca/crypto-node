const mongoose = require('mongoose');
const { Schema } = mongoose;

// Define the Balance schema
const balanceSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    balance: {
        type: Number,
        required: true
    },
    kaspa: {
        type: Number,
        required: true
    },
    electricity: {
        type: Number,
        required: true
    },
    payoutRequest: {
        type: Number,
        default: 0
    },
}, {
    timestamps: true
});
// Add a pre-save hook to update `updated_at` before saving
balanceSchema.pre('save', function (next) {
    this.updated_at = Date.now();
    next();
});

// Create and export the model
const Balance = mongoose.model('Balance', balanceSchema);
module.exports = Balance;
