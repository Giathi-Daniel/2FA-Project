const rateLimit = require('express-rate-limi')
const helmet = require('helmet')

const securityMiddleware = [
    helmet(),
    rateLimit({
        windowMs: process.env.RATE_LIMIT_WINDOW * 60 * 1000,
        max: process.env.RATE_LIMIT_MAX
    }),
    (req, res, next) => {
        res.setHeader('X-Content-Type-Options', 'nosniff')
        res.setHeader('X-Frame-Options', 'DENY')
        next()
    }
]

const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString()
}

module.exports = { securityMiddleware, generateOTP }