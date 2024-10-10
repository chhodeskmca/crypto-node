const nodemailer = require("nodemailer")
console.log(12321321)
const mailSMTP = nodemailer.createTransport({
    port: process.env.MAIL_PORT,
    host: process.env.MAIL_HOST,
    secure: false,
    auth: {
        user: process.env.MAIL_USERNAME,
        pass: process.env.MAIL_PASSWORD
    },
    tls: {
        ciphers: process.env.MAIL_ENCRYPTION
    }
})

mailSMTP.verify((error, success) => {
    if (error) {
        console.log('ERROR', 'Error connecting to Outlook SMTP server:', error)
    } else {
        console.log('INFO', 'Outlook SMTP server is ready to send emails')
    }
})


module.exports = {
    mailSMTP,
}