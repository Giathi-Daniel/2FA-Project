const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const csrf = require('csurf');
const cookieParser = require('cookie-parser');
const RateLimit = require('express-rate-limit');

const csrfProtection = csrf({
  cookie: {
    key: '_csrf',
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: 'strict'
  }
});

const securityMiddleware = [
  helmet(),
  rateLimit({
    windowMs: process.env.RATE_LIMIT_WINDOW * 60 * 1000,
    max: process.env.RATE_LIMIT_MAX
  }),
  (req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    next();
  },
  cookieParser(),
  csrfProtection
];

const authLimiter = RateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: 'Too many authentication attempts, please try again later'
});

const passwordResetLimiter = RateLimit({
  windowMs: 60 * 60 * 1000,
  max: 3,
  message: 'Too many password reset attempts, please try again later'
});

const apiLimiter = RateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
});

const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

exports.getCSRFToken = (req, res) => {
  res.json({ csrfToken: req.csrfToken() });
};

module.exports = {
  securityMiddleware,
  generateOTP,
  authLimiter,
  passwordResetLimiter,
  apiLimiter
};
