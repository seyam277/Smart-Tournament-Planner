import express from 'express'
import {
  register,
  registerAuthority,
  login,
  loginAuthority,
  requestPasswordReset,
  resetPassword
} from '../controllers/authController.js'

const router = express.Router()

// Register
router.post('/register', register)
router.post('/authority/register', registerAuthority)

// Login
router.post('/login', login)
router.post('/authority/login', loginAuthority)

// Request password reset
router.post('/forgot-password', requestPasswordReset)

// Reset password
router.post('/reset-password', resetPassword)

export default router
