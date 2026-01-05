const mongoose = require('mongoose');

// Define the schema for DefaultExchangeRates
const defaultExchangeRates = new mongoose.Schema({
    usd: {
        type: Number,
        required: true
    }
}, {
    timestamps: true // Automatically adds created_at and updated_at fields
});

// Create the model for DefaultExchangeRates
const DefaultExchangeRates = mongoose.model('DefaultExchangeRates', defaultExchangeRates, 'defaultRates');

module.exports = DefaultExchangeRates;
