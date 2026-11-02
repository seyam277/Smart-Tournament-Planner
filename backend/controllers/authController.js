import { hashPassword, comparePassword } from '../utils/passwordUtils.js'
import { generateToken, generatePasswordResetToken, verifyToken } from '../utils/jwtUtils.js'
import config from '../config/config.js'
import User from '../models/User.js'
import { sendPasswordResetEmail } from '../services/emailService.js'
import mongoose from 'mongoose'
import { mockDb } from '../services/mockDb.js'

const isDbConnected = () => mongoose.connection.readyState === 1
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const findMongooseUserByEmail = email => {
  const escapedEmail = email.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  return User.findOne({ email: { $regex: `^${escapedEmail}$`, $options: 'i' } })
}

const publicUser = (user, role) => {
  const profile = {
    id: String(user._id || user.id),
    name: user.name,
    email: user.email,
    phone: user.phone || '',
    role
  }

  if (role === 'authority') {
    profile.authorityProfile = user.authorityProfile || {}
  }

  return profile
}

const normalizeRole = role => role === 'authority' ? 'authority' : 'organizer'

const registerWithRole = async (req, res, role) => {
  try {
    const {
      name,
      email,
      password,
      phone,
      businessName,
      businessContactNumber,
      businessAddress,
      preferredContact
    } = req.body
    const normalizedEmail = String(email || '').trim().toLowerCase()

    if (!String(name || '').trim() || !normalizedEmail || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required.' })
    }
    if (!emailRegex.test(normalizedEmail)) {
      return res.status(400).json({ error: 'Invalid email format.' })
    }
    if (typeof password !== 'string' || password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters.' })
    }
    if (role === 'authority' && (
      !String(phone || '').trim() ||
      !String(businessName || '').trim() ||
      !String(businessContactNumber || '').trim() ||
      !String(businessAddress || '').trim() ||
      !String(preferredContact || '').trim()
    )) {
      return res.status(400).json({ error: 'All Authority profile fields are required.' })
    }

    const existingUser = isDbConnected()
      ? await findMongooseUserByEmail(normalizedEmail)
      : await mockDb.findUserByEmail(normalizedEmail)

    if (existingUser) {
      return res.status(409).json({ error: 'Email already registered.' })
    }

    const userData = {
      name: String(name).trim(),
      email: normalizedEmail,
      password: await hashPassword(password),
      phone: String(phone || '').trim(),
      role,
      ...(role === 'authority' ? {
        authorityProfile: {
          businessName: String(businessName).trim(),
          businessContactNumber: String(businessContactNumber).trim(),
          businessAddress: String(businessAddress).trim(),
          preferredContact: String(preferredContact).trim()
        }
      } : {})
    }

    const user = isDbConnected()
      ? await User.create(userData)
      : await mockDb.createUser(userData)
    const profile = publicUser(user, role)
    const token = generateToken(profile.id, profile.email, role)

    return res.status(201).json({
      message: role === 'authority' ? 'Turf Authority registered successfully.' : 'Organizer registered successfully.',
      token,
      ...(role === 'authority' ? { authority: profile } : { organizer: profile })
    })
  } catch (error) {
    if (error.code === 'EMAIL_ALREADY_REGISTERED' || error.code === 11000) {
      return res.status(409).json({ error: 'Email already registered.' })
    }
    console.error('Registration error:', error.message)
    return res.status(500).json({ error: 'Registration failed.' })
  }
}

const loginWithRole = async (req, res, role) => {
  try {
    const normalizedEmail = String(req.body.email || '').trim().toLowerCase()
    const { password } = req.body

    if (!normalizedEmail || !password) {
      return res.status(400).json({ error: 'Email and password are required.' })
    }

    const user = isDbConnected()
      ? await findMongooseUserByEmail(normalizedEmail)
      : await mockDb.findUserByEmail(normalizedEmail)

    if (!user || !(await comparePassword(password, user.password))) {
      return res.status(401).json({ error: 'Invalid email or password.' })
    }

    const actualRole = normalizeRole(user.role)
    if (actualRole !== role) {
      return res.status(403).json({ error: `This account cannot sign in as ${role === 'authority' ? 'a Turf Authority' : 'an Organizer'}.` })
    }

    const profile = publicUser(user, actualRole)
    const token = generateToken(profile.id, profile.email, actualRole)
    return res.json({
      message: 'Login successful.',
      token,
      ...(actualRole === 'authority' ? { authority: profile } : { organizer: profile })
    })
  } catch (error) {
    console.error('Login error:', error.message)
    return res.status(500).json({ error: 'Login failed.' })
  }
}

export const register = (req, res) => registerWithRole(req, res, 'organizer')
export const registerAuthority = (req, res) => registerWithRole(req, res, 'authority')
export const login = (req, res) => loginWithRole(req, res, 'organizer')
export const loginAuthority = (req, res) => loginWithRole(req, res, 'authority')

export const requestPasswordReset = async (req, res) => {
  try {
    const email = String(req.body.email || '').trim().toLowerCase()
    if (!email) return res.status(400).json({ error: 'Email is required.' })

    if (!isDbConnected()) {
      const user = await mockDb.findUserByEmail(email)
      if (!user) return res.json({ message: 'If the email exists, a reset link has been sent.' })

      const resetToken = generatePasswordResetToken(user.id || user._id, user.email)
      const emailSent = await sendPasswordResetEmail(email, resetToken, user.name)
      if (!emailSent) return res.status(500).json({ error: 'Failed to send reset email.' })
      return res.json({
        message: 'Password reset email sent successfully.',
        ...(config.NODE_ENV === 'development' ? { token: resetToken } : {})
      })
    }

    const user = await findMongooseUserByEmail(email)
    if (!user) return res.json({ message: 'If the email exists, a reset link has been sent.' })

    const resetToken = generatePasswordResetToken(user._id, user.email)
    user.resetPasswordToken = resetToken
    user.resetPasswordExpires = Date.now() + 3600000
    await user.save()

    const emailSent = await sendPasswordResetEmail(email, resetToken, user.name)
    if (!emailSent) return res.status(500).json({ error: 'Failed to send reset email.' })
    return res.json({ message: 'Password reset email sent successfully.' })
  } catch (error) {
    console.error('Password reset error:', error.message)
    return res.status(500).json({ error: 'Failed to process password reset.' })
  }
}

export const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body
    if (!token || !newPassword) {
      return res.status(400).json({ error: 'Token and new password are required.' })
    }
    if (typeof newPassword !== 'string' || newPassword.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters.' })
    }

    const decoded = verifyToken(token)
    if (!decoded || decoded.type !== 'password-reset') {
      return res.status(401).json({ error: 'Invalid or expired reset token.' })
    }

    const hashedPassword = await hashPassword(newPassword)
    if (!isDbConnected()) {
      const success = await mockDb.updatePassword(decoded.email, hashedPassword)
      if (!success) return res.status(404).json({ error: 'User not found.' })
      return res.json({ message: 'Password reset successfully.' })
    }

    const user = await User.findById(decoded.organizerId)
    if (!user || !user.resetPasswordToken || user.resetPasswordToken !== token ||
        !user.resetPasswordExpires || user.resetPasswordExpires.getTime() < Date.now()) {
      return res.status(401).json({ error: 'Invalid or expired reset token.' })
    }

    user.password = hashedPassword
    user.resetPasswordToken = undefined
    user.resetPasswordExpires = undefined
    await user.save()
    return res.json({ message: 'Password reset successfully.' })
  } catch (error) {
    console.error('Reset password error:', error.message)
    return res.status(500).json({ error: 'Failed to reset password.' })
  }
}

export default {
  register,
  registerAuthority,
  login,
  loginAuthority,
  requestPasswordReset,
  resetPassword
}
