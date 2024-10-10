const mongoose = require('mongoose');

const settingSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    value: {
        type: Array, // For flexible value types like array or object
        required: true
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

// Middleware to update the updated_at field before saving
settingSchema.pre('save', function (next) {
    this.updated_at = Date.now();
    next();
});

module.exports = mongoose.model('Setting', settingSchema);
