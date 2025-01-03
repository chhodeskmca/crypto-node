const { WEB_DOMAINS, ROLE_TYPES } = require('../config')
const User = require('../src/users/userModel')
require('dotenv').config()

const originCheckMiddleware = async (req, res, next) => {

    try {
        const domain = Object.keys(WEB_DOMAINS).find(domain => req.headers.origin.includes(domain))

        const user = await User.findOne({ email: { $regex: new RegExp('^' + req.body.email + '$', 'i') } })


        if (domain !== 'localhost') {
            if (!user) {
                return res.status(401).json({ error: 'Invalid credentials' })
            }

            else if (!user?.origin?.includes(domain)) {
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
        res.status(401).json({ error: 'Access denied. Invalid credentials!!' })
    }
}

module.exports = originCheckMiddleware
