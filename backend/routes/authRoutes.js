import express from 'express'
import { register, login, requestPasswordReset, resetPassword } from '../controllers/authController.js'

const router = express.Router()

// Register
router.post('/register', register)

// Login
router.post('/login', login)

// Request password reset
router.post('/forgot-password', requestPasswordReset)

// Reset password
router.post('/reset-password', resetPassword)

export default router
