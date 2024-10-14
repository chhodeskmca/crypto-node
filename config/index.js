const nodemailer = require("nodemailer")
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


const ROLE_TYPES = {
    'SUPER_ADMIN': 'SUPER_ADMIN',
    'ADMIN': 'ADMIN',
    'USER': 'USER'
}


const WEB_DOMAINS = {
    'localhost': ROLE_TYPES.SUPER_ADMIN,
    'mrcryptomining': ROLE_TYPES.SUPER_ADMIN,
    'coinpromining': ROLE_TYPES.ADMIN,
    'm2xcrypto': ROLE_TYPES.ADMIN
}

module.exports = {
    mailSMTP,
    ROLE_TYPES,
    WEB_DOMAINS
}