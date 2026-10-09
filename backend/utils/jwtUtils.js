import jwt from 'jsonwebtoken'
import config from '../config/config.js'

export const generateToken = (organizerId, email) => {
  return jwt.sign(
    { organizerId, email },
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
    console.log('[JWT] Verifying token with secret:', config.JWT_SECRET.substring(0, 5) + '...')
    return jwt.verify(token, config.JWT_SECRET)
  } catch (err) {
    console.error('[JWT] Verification failed:', err.message)
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
