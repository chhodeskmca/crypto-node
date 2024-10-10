const nodemailer = require('nodemailer');

exports.sendPayoutRequestMail = async (data) => {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.MAIL_USERNAME,
            pass: process.env.MAIL_PASSWORD,
        },
    });

    const mailOptions = {
        from: process.env.MAIL_USERNAME,
        to: process.env.MAIL_ADMIN,
        subject: 'Payout Request',
        text: `New payout request from ${data.content}`,
    };

    try {
        await transporter.sendMail(mailOptions);
    } catch (error) {
        console.error('Error sending mail:', error);
    }
};
// Send email to admin
exports.sendEmailToAdmin = (data) => {
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: process.env.EMAIL_ADMIN,
        subject: 'Performance Request',
        text: `User ${data.name} has requested ${data.performance}.`
    };

    return transporter.sendMail(mailOptions);
};