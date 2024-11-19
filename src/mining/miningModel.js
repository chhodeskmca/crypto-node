const mongoose = require('mongoose')

const miningSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    coinId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Coins',
        required: true
    },
    minsCount: {
        type: Number,
        default: 0
    },
    hour: {
        type: Object,
        default: []
    },
    earnings: {
        type: Object,
        default: []
    },
    settings: {
        walletAddress: {
            type: String,
            required: true
        },
        minPayoutAmount: {
            type: Number,
            default: 0,
            required: true
        },
        orderedHashrate: {
            type: Number,
            default: 0,
            required: true
        },
        electricitySpendings: {
            type: Number,
            default: 0,
            required: true
        },
        electricityExchange: {
            type: Number,
            required: true
        }
    }
}, {
    timestamps: true,
})

const Mining = mongoose.model('Mining', miningSchema)

module.exports = Mining

