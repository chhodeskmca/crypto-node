const { WEB_DOMAINS, ROLE_TYPES } = require('../config')
const User = require('../src/users/userModel')
require('dotenv').config()

const originCheckMiddleware = async (req, res, next) => {

    try {
        const domain = Object.keys(WEB_DOMAINS).find(domain => req.headers.origin.includes(domain))
        console.log('domain:', domain)
        const user = await User.findOne({ email: req.body.email })


        if (domain !== 'localhost') {
            if (!user.origin.includes(domain) || !user) {
                return res.status(401).json({ error: 'Access denied. Invalid credentials' })
            }
        }

        if (domain) {
            req.accessType = WEB_DOMAINS[domain]
        } else {
            req.accessType = ROLE_TYPES.USER
        }

        next()
    } catch (error) {
        console.log('error:', error)
        res.status(401).json({ error: 'Invalid token.' })
    }
}

module.exports = originCheckMiddleware
