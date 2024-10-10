const mongoose = require('mongoose');

const miningSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    minsCount: { type: Number, default: 0 },
    hoursCount: { type: Number, default: 0 },
    daysCount: { type: Number, default: 0 },
    weekCount: { type: Number, default: 0 },
    hour: { type: Object, default: [] },
    day: { type: Object, default: [] },
    week: { type: Object, default: [] },
    month: { type: Object, default: [] },
}, {
    timestamps: true,
});

const Mining = mongoose.model('Mining', miningSchema);

module.exports = Mining;
