const User = require('../models/User')
const bcrypt = require('bcryptjs')
const  { generateOTP } = require('../utils/security')
const { sendOTPEmail } = require('../utils/emailService')

exports.register = async (req, res) => {
    try {
        const { email, password } = req.body

        // check existing user
        const existingUser = await User.findOne({ email })
        if(existingUser) {
            return res.status(400).json({ error: 'User already exists' })
        }

        // Create user
        const user = new User({ email, password })

        // Generate OTP
        const otp = generateOTP()
        user.otp = {
            code: await bcrypt.hash(otp, 10),
            expiresAt: new Date(Date.now() + process.env.OTP_EXPIRY_MINUTES * 60000)
        }

        await user.save()

        // send OTP email
        await sendOTPEmail(email, otp)

        res.status(201).json({
            message: 'Registration successful. Check email for verification code',
            email: user.email
        })
    } catch (err) {
        console.error(err)
        res.status(500).json({ error: 'Server error' })
    }
}

exports.verifyOTP = async (req, res) => {
    try {
        const { email, otp } = req.body

        const user = await User.findOne({ email })
        if(!user) {
            return res.status(404).json({ error: 'User not found' })
        }

        // Check OTP validity
        if (Date.now() > user.otp.expiresAt) {
            return res.status(400).json({ error: 'OTP expired' })
        }
        
        const isValid = await bcrypt.compare(otp, user.otp.code)
        if (!isValid) {
            return res.status(400).json({ error: 'Invalid OTP' })
        }

        // Mark user as verified
        user.isVerified = true
        user.otp = undefined
        await user.save()

        res.json({ message: 'Verification successful' })
    } catch (err) {
        res.status(500).json({ error: 'Server error' })
    }
}