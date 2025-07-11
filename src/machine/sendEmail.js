const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

function loadTemplate(data, temp) {
    const templatePath = path.join(__dirname, '.', 'emailTemplates', temp);
    let template = fs.readFileSync(templatePath, 'utf8');
    Object.keys(data).forEach(key => {
        const regex = new RegExp(`{{${key}}}`, 'g');
        template = template.replace(regex, data[key]);
    });
    return template;
}

const transporter = nodemailer.createTransport({
    host: process.env.MAIL_HOST,
    port: process.env.MAIL_PORT,
    secure: true,
    auth: {
        user: process.env.MAIL_USERNAME,
        pass: process.env.MAIL_PASSWORD
    }
});

async function sendEmail(to, subject, data, template) {
    try {
        const htmlContent = loadTemplate(data, template);

        const mailOptions = {
            from: process.env.MAIL_USERNAME,
            to,
            subject,
            html: htmlContent,
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent:', info.response);
        return info;
    } catch (error) {
        console.error('Error sending email:', error);
        throw error;
    }
}

module.exports = { sendEmail };
