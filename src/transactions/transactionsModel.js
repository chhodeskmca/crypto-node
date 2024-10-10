const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    amount: {
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
    }
}, {
    timestamps: true,
});
transactionSchema.virtual('user', {
    ref: 'User',
    localField: 'userId',
    foreignField: '_id',
    justOne: true
});

transactionSchema.set('toObject', { virtuals: true });
transactionSchema.set('toJSON', { virtuals: true });

const Transaction = mongoose.model('Transaction', transactionSchema);

module.exports = Transaction;
