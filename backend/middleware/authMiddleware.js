import { mockDb } from '../services/mockDb.js'
import { verifyToken } from '../utils/jwtUtils.js'

export const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization
  const token = authHeader?.split(' ')[1]
  
  if (!token) {
    console.warn(`[Auth] No token provided for ${req.method} ${req.url}`)
    return res.status(401).json({ error: 'No token provided' })
  }
  
  try {
    const decoded = verifyToken(token)
    
    if (!decoded || decoded.type === 'password-reset') {
      return res.status(401).json({ error: 'Invalid or expired token' })
    }

    const role = decoded.role || 'organizer'
    if (!['organizer', 'authority'].includes(role)) {
      return res.status(401).json({ error: 'Invalid or expired token' })
    }

    req.organizer = { ...decoded, role }
    req.user = req.organizer
    next()
  } catch (err) {
    console.error('[Auth] Token verification error:', err.message)
    return res.status(401).json({ error: 'Authentication failed' })
  }
}

export const requireRole = (...allowedRoles) => (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required.' })
  }
  if (!allowedRoles.includes(req.user.role || 'organizer')) {
    return res.status(403).json({ error: 'You do not have permission to access this resource.' })
  }
  next()
}

export const optionalAuthMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1]
  
  if (token) {
    const decoded = verifyToken(token)
    if (decoded && decoded.type !== 'password-reset') {
      const role = decoded.role || 'organizer'
      if (['organizer', 'authority'].includes(role)) {
        req.organizer = { ...decoded, role }
        req.user = req.organizer
      }
    }
  }
  
  next()
}

// Authority Permission Middleware (Strict 401/403 Enforcement)
export const authorityMiddleware = async (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required.' })
  }
  if (req.user.role !== 'authority') {
    return res.status(403).json({ error: 'Turf Authority access is required.' })
  }

  const turfId = req.params.turfId
  if (!turfId) return next()

  const userId = req.user.organizerId || req.user.userId || req.user.id
  if (!userId) {
    return res.status(401).json({ error: 'Authenticated account ID is missing.' })
  }

  try {
    const turf = await mockDb.findTurfByAuthority(turfId, userId)
    if (!turf) return res.status(404).json({ error: 'Turf not found.' })
    req.turf = turf
    return next()
  } catch (err) {
    console.error('[Authority Ownership Error]:', err.message)
    return res.status(500).json({ error: 'Unable to verify turf ownership.' })
  }
}

export default {
  authMiddleware,
  optionalAuthMiddleware,
  requireRole,
  authorityMiddleware
}
