const mongoose = require('mongoose');

// Define the schema for DefaultMining
const defaultMiningSchema = new mongoose.Schema({
    minimum: {
        type: Number,
        required: true
    },
    maximum: {
        type: Number,
        required: true
    },
    electricityExchange: {
        type: Number,
        required: true
    }
}, {
    timestamps: true // Automatically adds created_at and updated_at fields
});

// Create the model for DefaultMining
const DefaultMining = mongoose.model('DefaultMining', defaultMiningSchema);

module.exports = DefaultMining;
