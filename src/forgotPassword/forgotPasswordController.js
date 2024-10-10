const forgotPasswordService = require("./forgotPasswordService");
const User = require("../users/userModel");
const nodemailer = require("nodemailer");
const bcrypt = require("bcrypt");
const ForgotPassword = require("./forgotPasswordModel");

exports.createOrUpdateForgotPasswordEntry = async (req, res) => {
    try {
        const { email } = req.body;
        const { otp } =
            await forgotPasswordService.createOrUpdateForgotPasswordEntry(email);

        // Setup nodemailer or another email sending service
        const transporter = nodemailer.createTransport({
            host: process.env.MAIL_HOST, // smtp.your-email-provider.com
            port: process.env.MAIL_PORT, // 587
            secure: process.env.MAIL_ENCRYPTION === "ssl", // true for 465, false for other ports
            auth: {
                user: process.env.MAIL_USERNAME, // your_email@example.com
                pass: process.env.MAIL_PASSWORD, // your_email_password
            },
            tls: {
                rejectUnauthorized: false,
            },
        });

        await transporter.sendMail({
            from: process.env.MAIL_FROM_ADDRESS, // your_email@example.com
            to: email,
            subject: "Forgot Password OTP",
            text: `Your OTP is ${otp}. It is valid for 10 minutes.`,
        });

        res.status(200).json({
            message:
                "We have sent an OTP to your email address. Please check and use it while resetting your password.",
            status: true,
        });
    } catch (error) {
        res.status(404).json({ error: error.message });
    }
};

exports.resetPassword = async (req, res) => {
    try {
        const { otp, password } = req.body;
        const forgotPasswordEntry =
            await forgotPasswordService.findForgotPasswordEntry(otp);

        if (!forgotPasswordEntry) {
            return res.status(404).json({ message: "Invalid OTP." });
        }

        const currentTime = new Date();
        if (currentTime > forgotPasswordEntry.validDuration) {
            return res.status(404).json({ message: "OTP has expired" });
        }

        const user = await User.findById(forgotPasswordEntry.userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        user.password = await bcrypt.hash(password, 10);
        await user.save();

        await ForgotPassword.deleteOne({ otp });

        res.status(200).json({
            message: "Password updated successfully.",
            data: { isAdmin: user.isAdmin },
            status: true,
        });
    } catch (error) {
        res.status(404).json({ error: error.message });
    }
};
