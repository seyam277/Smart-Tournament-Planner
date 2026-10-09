import { verifyToken } from '../utils/jwtUtils.js'
import { mockDb } from '../services/mockDb.js'

export const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization
  const token = authHeader?.split(' ')[1]
  
  if (!token) {
    console.warn(`[Auth] No token provided for ${req.method} ${req.url}`)
    return res.status(401).json({ error: 'No token provided' })
  }
  
  try {
    const decoded = verifyToken(token)
    
    if (!decoded) {
      console.warn(`[Auth] Invalid token received: ${token.substring(0, 10)}...`)
      return res.status(401).json({ error: 'Invalid or expired token' })
    }
    
    req.organizer = decoded
    req.user = decoded
    next()
  } catch (err) {
    console.error('[Auth] Token verification error:', err.message)
    return res.status(401).json({ error: 'Authentication failed' })
  }
}

export const optionalAuthMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1]
  
  if (token) {
    const decoded = verifyToken(token)
    if (decoded) {
      req.organizer = decoded
      req.user = decoded
    }
  }
  
  next()
}

// Authority Permission Middleware (Strict 401/403 Enforcement)
export const authorityMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization
  const token = authHeader?.split(' ')[1]

  if (!token) {
    return res.status(401).json({ error: 'Authentication required. No token provided.' })
  }

  try {
    const decoded = verifyToken(token)
    if (!decoded) {
      return res.status(401).json({ error: 'Invalid or expired token.' })
    }

    req.organizer = decoded
    req.user = decoded

    const userId = decoded.organizerId || decoded.id || decoded.userId
    const email = decoded.email

    // If a specific turf fieldId is targeted, verify ownership
    const fieldId = req.params.fieldId || req.body.fieldId
    if (fieldId) {
      const turf = await mockDb.findTurfById(fieldId)
      if (!turf) {
        return res.status(404).json({ error: 'Turf not found.' })
      }

      // Check if user is the assigned authority for this turf
      const isOwner = (turf.authorityId && (turf.authorityId === userId || turf.authorityId === decoded.organizerId)) ||
                      (turf.authorityEmail && turf.authorityEmail.toLowerCase() === email?.toLowerCase()) ||
                      decoded.role === 'authority' ||
                      decoded.role === 'admin'

      if (!isOwner) {
        return res.status(403).json({ error: 'Forbidden: You do not have authority permission to manage this turf.' })
      }

      req.turf = turf
    }

    next()
  } catch (err) {
    console.error('[Authority Auth Error]:', err.message)
    return res.status(403).json({ error: 'Authority authorization failed.' })
  }
}

export default {
  authMiddleware,
  optionalAuthMiddleware,
  authorityMiddleware
}
