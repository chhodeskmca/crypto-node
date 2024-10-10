const mongoose = require('mongoose');

const adminAuthenticationSchema = new mongoose.Schema({
    otp: {
        type: String,
        required: true,
    },
    validDuration: {
        type: Date,
        required: true,
    },
    userInfo: {
        type: String,
        required: true,
    },
    authenticationEnabled: {
        type: Boolean,
        default: true,
    }
});

const AdminAuthentication = mongoose.model('AdminAuthentication', adminAuthenticationSchema);

module.exports = AdminAuthentication;
