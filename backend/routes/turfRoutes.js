import express from 'express';
import { mockDb } from '../services/mockDb.js';

const router = express.Router();

// 1. GET all turfs - returns JSON array
router.get('/', async (req, res) => {
  try {
    const turfs = await mockDb.findTurfs();
    res.json(Array.isArray(turfs) ? turfs : []);
  } catch (err) {
    console.error('Error fetching turfs:', err);
    res.status(500).json({ error: err.message, message: 'Failed to fetch turfs' });
  }
});

// 2. Bookings endpoints (Must be before /:id)
router.post('/bookings', async (req, res) => {
  try {
    const booking = await mockDb.createBooking({ ...req.body, status: req.body.status || 'PENDING' });
    res.status(201).json(booking);
  } catch (err) {
    console.error('Error creating booking:', err);
    res.status(400).json({ error: err.message, message: err.message });
  }
});

router.get('/bookings/user/:userId', async (req, res) => {
  try {
    const bookings = await mockDb.findBookingsByUserId(req.params.userId);
    res.json(Array.isArray(bookings) ? bookings : []);
  } catch (err) {
    console.error('Error fetching user bookings:', err);
    res.status(500).json({ error: err.message, message: err.message });
  }
});

// 3. Field slots endpoint
router.get('/:fieldId/slots', async (req, res) => {
  try {
    const { date } = req.query;
    const slots = await mockDb.findSlotsByFieldAndDate(req.params.fieldId, date);
    res.json(Array.isArray(slots) ? slots : []);
  } catch (err) {
    console.error('Error fetching field slots:', err);
    res.status(500).json({ error: err.message, message: err.message });
  }
});

// 4. Reviews endpoints
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
    
    // Check if review already exists
    const existing = await mockDb.findReviewByUserAndBooking(userId, bookingId);
    if (existing) {
      return res.status(400).json({ message: 'You have already reviewed this booking.' });
    }

    const newReview = await mockDb.createReview({ fieldId, bookingId, userId, rating, comment, userName });
    res.status(201).json(newReview);
  } catch (err) {
    console.error('Error creating review:', err);
    res.status(500).json({ error: err.message, message: err.message });
  }
});

// 5. Create new turf
router.post('/', async (req, res) => {
  try {
    const newTurf = await mockDb.createTurf(req.body);
    res.status(201).json(newTurf);
  } catch (err) {
    console.error('Error creating turf:', err);
    res.status(500).json({ error: err.message, message: err.message });
  }
});

// 6. GET single turf by ID
router.get('/:id', async (req, res) => {
  try {
    const turf = await mockDb.findTurfById(req.params.id);
    if (!turf) return res.status(404).json({ message: 'Turf not found' });
    res.json(turf);
  } catch (err) {
    console.error('Error fetching turf by ID:', err);
    res.status(500).json({ error: err.message, message: err.message });
  }
});

export default router;
