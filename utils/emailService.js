const { mailSMTP } = require('../config');

exports.sendPayoutRequestMail = async (data) => {

    const mailOptions = {
        from: process.env.MAIL_USERNAME,
        to: process.env.MAIL_ADMIN,
        subject: 'Payout Request',
        text: `New payout request from ${data.content}`,
    };

    try {
        const response = await mailSMTP.sendMail(mailOptions)
        console.log("Email sent:", response)
    } catch (error) {
        console.error('Error sending mail:', error)
    }
}

// Send email to admin
exports.sendEmailToAdmin = async (data) => {
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: process.env.EMAIL_ADMIN,
        subject: 'Performance Request',
        text: `User ${data.name} has requested ${data.performance}.`
    };

    try {
        const response = await mailSMTP.sendMail(mailOptions)
        console.log("Email sent:", response)
    } catch (error) {
        console.error('Error sending mail:', error)
    }
}

// Send email to new user without wallet address
exports.sendMailToNewUserWithoutWallet = async (data) => {
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: data.email,
        subject: 'Please provide Kaspa wallet',
        text: `Dear ${data.name},\n\nThank you for confirming your payout request.\n\nTo proceed with the payout, please provide your Kaspa wallet address by replying to this email. Once we receive your wallet address, we will process the payout accordingly.\n\nIf you have already shared your wallet address, please ignore this message.\n\nKind regards,\nMr. Crypto Mining Team`
    };

    try {
        const response = await mailSMTP.sendMail(mailOptions)
        console.log("Email sent:", response)
    } catch (error) {
        console.error('Error sending mail:', error)
    }
}