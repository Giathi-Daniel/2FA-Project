const nodemailer = require('nodemailer')

const transporterr = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: false,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
})

const sendOTPEmail = async (email, otp) => {
    try {
        await transporterr.sendMail({
            from: `Secure2FA <${process.env.EMAIL_USER}>`,
            to: email,
            subject: 'Your Verification Code',
            html: `
                <div style="font-family: Arial, sans-serif; max-inline-width: 600px; margin: 0 auto;">
                    <h2 style="color: #2563eb;">Secure2FA Verification</h2>
                    <p>Your verification code is:</p>
                    <div style="font-size: 24px; font-weight: bold; color: #2563eb; margin: 20px 0;">
                        ${otp}
                    </div>
                    <p>This code will expire in ${process.env.OTP_EXPIRY_MINUTES} minutes.</p>
                </div>
            `
        })
    } catch (err) {
        console.error('Email sending error:', err)
        throw new Error('Failed to send verification email')
    }
}

module.exports = { sendOTPEmail }