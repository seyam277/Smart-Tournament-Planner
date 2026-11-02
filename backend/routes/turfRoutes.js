import express from 'express';
import { mockDb } from '../services/mockDb.js';
import {
  authMiddleware,
  authorityMiddleware,
  requireRole
} from '../middleware/authMiddleware.js';
import {
  createBooking,
  createField,
  createTurf,
  deleteField,
  deleteTurf,
  getMyTurf,
  getPublicTurf,
  getUserBookings,
  listMyTurfs,
  listPublicTurfs,
  updateField,
  updateTurf
} from '../controllers/turfController.js';

const router = express.Router();
const authorityAuth = [authMiddleware, requireRole('authority')];
const ownedTurf = [...authorityAuth, authorityMiddleware];

router.get('/', listPublicTurfs);
router.get('/mine', ...authorityAuth, listMyTurfs);
router.post('/', ...authorityAuth, createTurf);

router.get('/mine/:turfId', ...ownedTurf, getMyTurf);
router.put('/mine/:turfId', ...ownedTurf, updateTurf);
router.delete('/mine/:turfId', ...ownedTurf, deleteTurf);
router.post('/mine/:turfId/fields', ...ownedTurf, createField);
router.put('/mine/:turfId/fields/:fieldId', ...ownedTurf, updateField);
router.delete('/mine/:turfId/fields/:fieldId', ...ownedTurf, deleteField);

router.post('/bookings', authMiddleware, requireRole('organizer'), createBooking);
router.get('/bookings/user/:userId', authMiddleware, requireRole('organizer'), getUserBookings);

router.get('/:fieldId/slots', async (req, res) => {
  try {
    const slots = await mockDb.findSlotsByFieldAndDate(req.params.fieldId, req.query.date);
    res.json(Array.isArray(slots) ? slots : []);
  } catch (err) {
    console.error('Error fetching field slots:', err);
    res.status(500).json({ error: err.message, message: err.message });
  }
});

router.get('/:fieldId/reviews', async (req, res) => {
  try {
    const reviews = await mockDb.findReviewsByFieldId(req.params.fieldId);
    res.json(Array.isArray(reviews) ? reviews : []);
  } catch (err) {
    console.error('Error fetching reviews:', err);
    res.status(500).json({ error: err.message, message: err.message });
  }
});

router.post('/:fieldId/reviews', async (req, res) => {
  try {
    const { fieldId } = req.params;
    const { bookingId, userId, rating, comment, userName } = req.body;
    const existing = await mockDb.findReviewByUserAndBooking(userId, bookingId);
    if (existing) {
      return res.status(400).json({ message: 'You have already reviewed this booking.' });
    }

    const newReview = await mockDb.createReview({ fieldId, bookingId, userId, rating, comment, userName });
    return res.status(201).json(newReview);
  } catch (err) {
    console.error('Error creating review:', err);
    return res.status(500).json({ error: err.message, message: err.message });
  }
});

router.get('/:id', getPublicTurf);

export default router;
