const nodemailer = require("nodemailer")
console.log(12321321)
const mailSMTP = nodemailer.createTransport({
    port: process.env.MAIL_PORT,
    host: process.env.MAIL_HOST,
    secure: true,
    auth: {
        user: process.env.MAIL_USERNAME,
        pass: process.env.MAIL_PASSWORD
    },
    tls: {
        rejectUnauthorized: false
    }
})

mailSMTP.verify((error, success) => {
    if (error) {
        console.error('Error connecting to Outlook SMTP server:', error)
    } else {
        console.log('SMTP server is ready to send emails')
    }
})


module.exports = {
    mailSMTP,
}