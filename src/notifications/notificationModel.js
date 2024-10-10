const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    status: {
        type: Boolean,
        required: true
    },
    image: {
        type: String,
        default: null
    },
}, {
    timestamps: true
});

module.exports = mongoose.model('Notification', NotificationSchema);
