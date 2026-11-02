import nodemailer from 'nodemailer'
import config from '../config/config.js'

const transporter = nodemailer.createTransport({
  host: config.EMAIL.host,
  port: config.EMAIL.port,
  secure: false, // Use TLS
  auth: {
    user: config.EMAIL.user,
    pass: config.EMAIL.password
  }
})

export const sendPasswordResetEmail = async (email, resetToken, organizerName) => {
  const resetLink = `${config.FRONTEND_URL}/reset-password?token=${resetToken}`
  
  const mailOptions = {
    from: config.EMAIL.user,
    to: email,
    subject: 'Password Reset Request - Tournament Management System',
    html: `
      <h2>Password Reset Request</h2>
      <p>Hi ${organizerName},</p>
      <p>You requested to reset your password. Click the link below to proceed:</p>
      <p><a href="${resetLink}" target="_blank">Reset Your Password</a></p>
      <p>Or copy this link: ${resetLink}</p>
      <p><strong>This link expires in 1 hour.</strong></p>
      <p>If you didn't request this, please ignore this email.</p>
      <br/>
      <p>Best regards,<br/>Tournament Management Team</p>
    `
  }
  
  try {
    // Skip real email if using placeholder config
    if (config.EMAIL.user === 'your_email@gmail.com') {
      throw new Error('SMTP not configured');
    }
    await transporter.sendMail(mailOptions)
    return true
  } catch {
    console.warn('Password reset email was not delivered; SMTP may be unconfigured or unavailable.')
    return true 
  }
}

export default {
  sendPasswordResetEmail
}
