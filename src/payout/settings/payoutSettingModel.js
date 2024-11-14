const mongoose = require('mongoose');

const PayoutSettingSchema = new mongoose.Schema({
    minimumBalance: {
        type: Number,
        required: true,
    },
    coinId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Coin',
        required: true
    }
}, { timestamps: true });

module.exports = mongoose.model('PayoutSetting', PayoutSettingSchema);
