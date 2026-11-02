import jwt from 'jsonwebtoken'
import config from '../config/config.js'

export const generateToken = (organizerId, email, role = 'organizer') => {
  if (!['organizer', 'authority'].includes(role)) {
    throw new Error('Cannot create an access token for an unsupported role.')
  }

  return jwt.sign(
    { organizerId, email, role },
    config.JWT_SECRET,
    { expiresIn: config.JWT_EXPIRY }
  )
}

export const generatePasswordResetToken = (organizerId, email) => {
  return jwt.sign(
    { organizerId, email, type: 'password-reset' },
    config.JWT_SECRET,
    { expiresIn: '1h' }
  )
}

export const verifyToken = (token) => {
  try {
    return jwt.verify(token, config.JWT_SECRET)
  } catch (err) {
    return null
  }
}

export const decodeToken = (token) => {
  try {
    return jwt.decode(token)
  } catch (err) {
    return null
  }
}

export default {
  generateToken,
  generatePasswordResetToken,
  verifyToken,
  decodeToken
}
