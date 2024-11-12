const mongoose = require('mongoose')

const schema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    settings: {
        electricityExchange: {
            type: Number,
            required: false
        },
        mining: {
            min: {
                type: Number,
                required: false
            },
            max: {
                type: Number,
                required: false
            }
        }
    },
    imagePath: {
        type: String,
        default: null
    },
    color: {
        type: String,
        default: null
    }
}, {
    timestamps: true
})

const Coin = mongoose.model('Coin', schema)

module.exports = Coin