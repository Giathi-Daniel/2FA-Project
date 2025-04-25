const User = require('../models/User')
const bcrypt = require('bcryptjs')
const  { generateOTP } = require('../utils/security')
const { sendOTPEmail } = require('../utils/emailService')
const jwt = require('jsonwebtoken')

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

exports.login = async (req, res) => {
    try {
      const { email, password } = req.body;
      const user = await User.findOne({ email });
  
      if (!user || !(await bcrypt.compare(password, user.password))) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }
  
      // Generate OTP and send email
      const otp = generateOTP();
      user.otp = {
        code: await bcrypt.hash(otp, 10),
        expiresAt: new Date(Date.now() + process.env.OTP_EXPIRY_MINUTES * 60000)
      };
      
      await user.save();
      await sendOTPEmail(email, otp);
  
      res.json({ message: 'OTP sent to registered email' });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Server error' });
    }
  };
  
  exports.forgotPassword = async (req, res) => {
    try {
      const user = await User.findOne({ email: req.body.email });
      if (!user) return res.status(200).json({ message: 'Reset email sent if account exists' });
  
      const resetToken = jwt.sign(
        { id: user._id },
        process.env.JWT_SECRET + user.password,
        { expiresIn: '10m' }
      );
  
      user.passwordResetToken = resetToken;
      user.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
      await user.save();
  
      await sendPasswordResetEmail(user.email, resetToken);
      res.json({ message: 'Password reset email sent' });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Server error' });
    }
  };
  
  exports.resetPassword = async (req, res) => {
    try {
      const user = await User.findOne({
        passwordResetToken: req.params.token,
        passwordResetExpires: { $gt: Date.now() }
      });
  
      if (!user) return res.status(400).json({ error: 'Invalid or expired token' });
  
      user.password = req.body.password;
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
      await user.save();
  
      res.json({ message: 'Password updated successfully' });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Server error' });
    }
  };

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

    const token = jwt.sign(
        { id: user._id },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '1h' }
    );
    
    res.json({ 
        message: 'Verification successful',
        token,
        user: {
          id: user._id,
          email: user.email,
          isVerified: user.isVerified
        }
    });
}