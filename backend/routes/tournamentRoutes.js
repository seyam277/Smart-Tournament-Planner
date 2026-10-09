import express from 'express'
import { 
  createTournament,
  getTournaments,
  getTournamentById,
  updateTournament,
  deleteTournament,
  getMyTournaments 
} from '../controllers/tournamentController.js'
import { authMiddleware, optionalAuthMiddleware } from '../middleware/authMiddleware.js'

const router = express.Router()

// Protected routes (requires authentication) - MUST be before parametric routes
router.get('/my-tournaments', authMiddleware, getMyTournaments)
router.post('/', authMiddleware, createTournament)
router.put('/:id', authMiddleware, updateTournament)
router.delete('/:id', authMiddleware, deleteTournament)

// Public routes (view only) - MUST be after specific routes
router.get('/all', optionalAuthMiddleware, getTournaments)
router.get('/:id', optionalAuthMiddleware, getTournamentById)

export default router
