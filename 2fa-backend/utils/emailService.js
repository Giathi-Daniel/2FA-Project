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


const sendPasswordResetEmail = async (email, token) => {
    try {
      await transporter.sendMail({
        from: `Secure2FA <${process.env.EMAIL_USER}>`,
        to: email,
        subject: 'Password Reset Request',
        html: `
          <div style="font-family: Arial, sans-serif; max-inline-size: 600px; margin: 0 auto;">
            <h2 style="color: #2563eb;">Password Reset</h2>
            <p>Click the link below to reset your password:</p>
            <a href="${process.env.CLIENT_URL}/reset-password/${token}" 
               style="display: inline-block; padding: 10px 20px; background-color: #2563eb; 
                      color: white; text-decoration: none; border-radius: 5px; margin: 20px 0;">
              Reset Password
            </a>
            <p>This link will expire in 10 minutes.</p>
          </div>
        `
      });
    } catch (err) {
      console.error('Password reset email error:', err);
      throw new Error('Failed to send password reset email');
    }
};
  
module.exports = { sendOTPEmail, sendPasswordResetEmail };