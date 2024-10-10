const ForgotPassword = require('./forgotPasswordModel');
const User = require('../users/userModel');

exports.createOrUpdateForgotPasswordEntry = async (email) => {
    const user = await User.findOne({ email });
    if (!user) {
        throw new Error('Email not found.');
    }

    const otp = Math.floor(100000 + Math.random() * 900000); // Generate a 6-digit OTP
    const validDuration = new Date(Date.now() + 10 * 60 * 1000); // OTP valid for 10 minutes

    const forgotPasswordEntry = await ForgotPassword.findOneAndUpdate(
        { userId: user._id },
        { otp, validDuration, updated_at: Date.now() },
        { new: true, upsert: true }
    );

    return { otp, email }; // Return OTP and email for response
};

exports.findForgotPasswordEntry = async (otp) => {
    const entry = await ForgotPassword.findOne({ otp });
    return entry;
};
