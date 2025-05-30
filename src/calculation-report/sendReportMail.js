// src/mailer/mailer.js
const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Load email template
function loadTemplate(data) {
  const templatePath = path.join(__dirname, '..', 'emailTemplates', 'calculationEstimation.html');
  let template = fs.readFileSync(templatePath, 'utf8');
  template = template.replace('{{name}}', data.name).replace('{{message}}', data.message);
  return template;
}

// Create transporter
const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port: process.env.MAIL_PORT,
  secure: true,
  auth: {
    user: process.env.MAIL_USERNAME,
    pass: process.env.MAIL_PASSWORD
  }
});

// Send email function
async function sendEmail(to, subject, data) {
  try {
    const htmlContent = loadTemplate(data);
    const mailOptions = {
      from: process.env.MAIL_USERNAME,
      to,
      subject,
      html: htmlContent
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
