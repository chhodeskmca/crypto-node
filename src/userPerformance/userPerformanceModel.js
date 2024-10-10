const mongoose = require('mongoose');

const userPerformanceSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Reference to User model
        required: true
    },
    requestedPerformance: {
        type: Number,
        required: true
    },
    performanceHistory: {
        type: [Number], // Array of numbers
        default: []
    },
    created_at: {
        type: Date,
        default: Date.now
    },
    updated_at: {
        type: Date,
        default: Date.now
    }
});

// Update updated_at field before saving
userPerformanceSchema.pre('save', function (next) {
    this.updated_at = Date.now();
    next();
});

const UserPerformance = mongoose.model('UserPerformance', userPerformanceSchema);

module.exports = UserPerformance;
