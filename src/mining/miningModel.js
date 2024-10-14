const mongoose = require('mongoose');

const miningSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    minsCount: { type: Number, default: 0 },
    hour: { type: Object, default: [] },
    earnings: { type: Object, default: [] }
}, {
    timestamps: true,
});

const Mining = mongoose.model('Mining', miningSchema);

module.exports = Mining;
