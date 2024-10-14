const jwt = require('jsonwebtoken');
const { WEB_DOMAINS, ROLE_TYPES } = require('../config');
const User = require('../src/users/userModel');
const { ObjectId } = require('../config/db');
require('dotenv').config();

const authenticateToken = async (req, res, next) => {

    const authHeader = req.headers['authorization'];
    if (!authHeader) {
        return res.status(401).json({ error: 'Access denied. No token provided.' })
    }

    const token = authHeader.split(' ')[1]
    if (!token) {
        return res.status(401).json({ error: 'Access denied. No token provided.' })
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        req.user = decoded
        req.userId = decoded.id

        const domain = Object.keys(WEB_DOMAINS).find(domain => req.headers.origin.includes(domain))
        console.log('domain:', domain)
        const user = await User.findOne({ _id: new ObjectId(decoded.id))
        console.log('user:', user)

        console.log('domain !== WEB_DOMAINS.localhost:', domain !== WEB_DOMAINS.localhost)
        if (domain !== WEB_DOMAINS.localhost) {
            console.log('!user.origin.includes(domain):', !user.origin.includes(domain))
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
        res.status(400).json({ error: 'Invalid token.' })
    }
}

module.exports = authenticateToken
