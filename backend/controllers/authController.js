import { v4 as uuidv4 } from 'uuid'
import { hashPassword, comparePassword } from '../utils/passwordUtils.js'
import { generateToken, generatePasswordResetToken, verifyToken } from '../utils/jwtUtils.js'
import User from '../models/User.js'
import { sendPasswordResetEmail } from '../services/emailService.js'
import mongoose from 'mongoose'
import { mockDb } from '../services/mockDb.js'

// Helper to check if DB is connected
const isDbConnected = () => mongoose.connection.readyState === 1

// Register new organizer
export const register = async (req, res) => {
  try {
    const { name, email, password, phone } = req.body

    // Validate input
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Missing required fields' })
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Invalid email format' })
    }

    // Fallback to Mock DB if no connection
    if (!isDbConnected()) {
      console.log('[Auth] Using Mock DB for registration')
      const existingUser = await mockDb.findUserByEmail(email)
      if (existingUser) return res.status(400).json({ error: 'Email already registered' })
      
      const hashedPassword = await hashPassword(password)
      const user = await mockDb.createUser({ name, email, password: hashedPassword, phone })
      const token = generateToken(user.id, user.email)
      return res.status(201).json({ 
        message: 'User registered (Mock Mode)', 
        token, 
        organizer: { id: user.id, name: user.name, email: user.email } 
      })
    }

    // Check if email already exists
    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered' })
    }

    // Hash password
    const hashedPassword = await hashPassword(password)

    // Create new user
    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
      phone: phone || ''
    })

    // Generate token
    const token = generateToken(newUser._id, newUser.email)

    res.status(201).json({
      message: 'Organizer registered successfully',
      token,
      organizer: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        phone: newUser.phone
      }
    })
  } catch (error) {
    console.error('Register error:', error)
    res.status(500).json({ error: 'Registration failed' })
  }
}

// Login organizer
export const login = async (req, res) => {
  try {
    const { email, password } = req.body

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' })
    }

    // Fallback to Mock DB
    if (!isDbConnected()) {
      console.log('[Auth] Using Mock DB for login')
      const user = await mockDb.findUserByEmail(email)
      if (!user) return res.status(401).json({ error: 'Invalid email or password' })
      
      const isMatch = await comparePassword(password, user.password)
      if (!isMatch) return res.status(401).json({ error: 'Invalid email or password' })
      
      const token = generateToken(user.id, user.email)
      return res.json({ 
        message: 'Login successful (Mock Mode)',
        token, 
        organizer: { id: user.id, name: user.name, email: user.email } 
      })
    }

    // Find user by email
    const user = await User.findOne({ email })
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' })
    }

    // Compare password
    const isPasswordValid = await comparePassword(password, user.password)
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid email or password' })
    }

    // Generate token
    const token = generateToken(user._id, user.email)

    res.json({
      message: 'Login successful',
      token,
      organizer: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone
      }
    })
  } catch (error) {
    console.error('Login error:', error)
    res.status(500).json({ error: 'Login failed' })
  }
}

// Request password reset
export const requestPasswordReset = async (req, res) => {
  try {
    const { email } = req.body

    if (!email) {
      return res.status(400).json({ error: 'Email is required' })
    }

    // Mock mode for reset
    if (!isDbConnected()) {
      const user = await mockDb.findUserByEmail(email)
      if (!user) {
        return res.status(404).json({ error: 'Email not found' })
      }
      
      const resetToken = generatePasswordResetToken(user.id, user.email)
      // Call email service to log it to console
      await sendPasswordResetEmail(email, resetToken, user.name)
      
      return res.json({ 
        message: 'Mock Mode: Reset link generated',
        token: resetToken // Return token for the interactive frontend preview
      })
    }

    // Find user by email
    const user = await User.findOne({ email })
    if (!user) {
      return res.json({ message: 'If the email exists, a reset link has been sent' })
    }

    const resetToken = generatePasswordResetToken(user._id, user.email)
    user.resetPasswordToken = resetToken
    user.resetPasswordExpires = Date.now() + 3600000
    await user.save()

    const emailSent = await sendPasswordResetEmail(email, resetToken, user.name)
    if (!emailSent) return res.status(500).json({ error: 'Failed to send reset email' })

    res.json({ message: 'Password reset email sent successfully' })
  } catch (error) {
    console.error('Password reset error:', error)
    res.status(500).json({ error: 'Failed to process password reset' })
  }
}

// Reset password with token
export const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body

    if (!token || !newPassword) {
      return res.status(400).json({ error: 'Token and new password required' })
    }

    // Verify token
    const decoded = verifyToken(token)
    if (!decoded || decoded.type !== 'password-reset') {
      return res.status(401).json({ error: 'Invalid or expired reset token' })
    }

    // Fallback for Mock Mode
    if (!isDbConnected()) {
      console.log('[Auth] Using Mock DB for password reset')
      const hashedPassword = await hashPassword(newPassword)
      const success = await mockDb.updatePassword(decoded.email, hashedPassword)
      if (!success) return res.status(404).json({ error: 'User not found in Mock DB' })
      return res.json({ message: 'Password reset successfully (Mock Mode)' })
    }

    const user = await User.findById(decoded.organizerId)
    if (!user) return res.status(404).json({ error: 'User not found' })

    const hashedPassword = await hashPassword(newPassword)
    user.password = hashedPassword
    user.resetPasswordToken = undefined
    user.resetPasswordExpires = undefined
    await user.save()

    res.json({ message: 'Password reset successfully' })
  } catch (error) {
    console.error('Reset password error:', error)
    res.status(500).json({ error: 'Failed to reset password' })
  }
}

export default {
  register,
  login,
  requestPasswordReset,
  resetPassword
}
