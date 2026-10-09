import fs from 'fs';
import path from 'path';

const MOCK_DB_FILE = path.join(process.cwd(), 'mock_db.json');

// Helper: Generate consecutive dates array (UTC based to prevent date shifting)
export const getConsecutiveDates = (startDateStr, durationDays = 1) => {
  const dates = [];
  if (!startDateStr) return dates;
  const parts = startDateStr.split('-').map(Number);
  if (parts.length < 3 || isNaN(parts[0])) return dates;
  const [y, m, d] = parts;
  const start = new Date(Date.UTC(y, m - 1, d));
  const numDays = Math.max(1, parseInt(durationDays, 10) || 1);
  for (let i = 0; i < numDays; i++) {
    const cur = new Date(start);
    cur.setUTCDate(start.getUTCDate() + i);
    dates.push(cur.toISOString().split('T')[0]);
  }
  return dates;
};

// Helper: Convert "09:00 AM" to minutes from midnight
export const parseTimeToMinutes = (timeStr) => {
  if (!timeStr) return 0;
  const match = timeStr.trim().match(/(\d+):(\d+)\s*(AM|PM)/i);
  if (!match) return 0;
  let [_, hours, minutes, period] = match;
  let h = parseInt(hours, 10);
  const m = parseInt(minutes, 10);
  if (period.toUpperCase() === 'PM' && h !== 12) h += 12;
  if (period.toUpperCase() === 'AM' && h === 12) h = 0;
  return h * 60 + m;
};

// Helper: Check if two time intervals overlap
export const doTimesOverlap = (start1, end1, start2, end2) => {
  const s1 = parseTimeToMinutes(start1);
  const e1 = parseTimeToMinutes(end1);
  const s2 = parseTimeToMinutes(start2);
  const e2 = parseTimeToMinutes(end2);
  return s1 < e2 && e1 > s2;
};

const DEFAULT_TURFS = [
  {
    _id: "turf_bashundhara",
    id: "turf_bashundhara",
    name: "Bashundhara Sports Arena",
    location: "Bashundhara R/A, Dhaka",
    rating: 4.8,
    hourlyRate: 1500,
    authorityId: "user1",
    authorityEmail: "mahabubillaseyam00@gmail.com",
    facilities: ["Floodlights", "Changing Room", "Parking", "Drinking Water"]
  },
  {
    _id: "turf_daffodil",
    id: "turf_daffodil",
    name: "Daffodil Turf & Sports Complex",
    location: "Mirpur, Dhaka",
    rating: 4.6,
    hourlyRate: 1200,
    authorityId: "user2",
    authorityEmail: "2023-3-60-277@std.ewubd.edu",
    facilities: ["Floodlights", "Locker Room", "Cafeteria"]
  },
  {
    _id: "turf_united",
    id: "turf_united",
    name: "United Sports Arena",
    location: "Satarkul, Badda, Dhaka",
    rating: 4.7,
    hourlyRate: 1400,
    authorityId: "user1",
    authorityEmail: "mahabubillaseyam00@gmail.com",
    facilities: ["Turf Lighting", "Parking", "First Aid"]
  },
  {
    _id: "turf_gulshan",
    id: "turf_gulshan",
    name: "Gulshan Youth Arena",
    location: "Gulshan-2, Dhaka",
    rating: 4.9,
    hourlyRate: 1800,
    authorityId: "user3",
    authorityEmail: "test@example.com",
    facilities: ["FIFA Grade Turf", "Air-conditioned Dugout", "Dressing Rooms"]
  },
  {
    _id: "turf_dhanmondi",
    id: "turf_dhanmondi",
    name: "Dhanmondi Arena Turf",
    location: "Dhanmondi, Dhaka",
    rating: 4.5,
    hourlyRate: 1300,
    authorityId: "user1",
    authorityEmail: "mahabubillaseyam00@gmail.com",
    facilities: ["Floodlights", "Shower Room", "Parking"]
  }
];

const DEFAULT_TIME_SLOTS = [
  { id: 'slot-1', startTime: '09:00 AM', endTime: '11:00 AM' },
  { id: 'slot-2', startTime: '11:00 AM', endTime: '01:00 PM' },
  { id: 'slot-3', startTime: '01:00 PM', endTime: '03:00 PM' },
  { id: 'slot-4', startTime: '03:00 PM', endTime: '05:00 PM' },
  { id: 'slot-5', startTime: '05:00 PM', endTime: '07:00 PM' },
  { id: 'slot-6', startTime: '07:00 PM', endTime: '09:00 PM' }
];

const loadDb = () => {
  if (!fs.existsSync(MOCK_DB_FILE)) {
    const initial = { 
      users: [], 
      tournaments: [], 
      teams: [], 
      players: [], 
      matches: [], 
      turfs: DEFAULT_TURFS, 
      bookings: [], 
      reviews: [], 
      slots: [] 
    };
    fs.writeFileSync(MOCK_DB_FILE, JSON.stringify(initial, null, 2), 'utf8');
    return initial;
  }
  let raw = fs.readFileSync(MOCK_DB_FILE, 'utf8');
  if (raw.charCodeAt(0) === 0xFEFF) {
    raw = raw.slice(1);
  }
  const db = JSON.parse(raw);
  if (!db.turfs || !Array.isArray(db.turfs) || db.turfs.length === 0) {
    db.turfs = DEFAULT_TURFS;
    fs.writeFileSync(MOCK_DB_FILE, JSON.stringify(db, null, 2), 'utf8');
  } else {
    // Ensure all turfs have authorityId and authorityEmail
    let modified = false;
    db.turfs.forEach(t => {
      if (!t.authorityId) {
        t.authorityId = "user1";
        t.authorityEmail = "mahabubillaseyam00@gmail.com";
        modified = true;
      }
    });
    if (modified) {
      fs.writeFileSync(MOCK_DB_FILE, JSON.stringify(db, null, 2), 'utf8');
    }
  }
  db.bookings = db.bookings || [];
  db.reviews = db.reviews || [];
  db.slots = db.slots || [];
  return db;
};

const saveDb = (data) => {
  fs.writeFileSync(MOCK_DB_FILE, JSON.stringify(data, null, 2), 'utf8');
};

export const mockDb = {
  // Users
  async findUserByEmail(email) {
    const db = loadDb();
    return db.users.find(u => u.email === email);
  },
  async findUserById(id) {
    const db = loadDb();
    return db.users.find(u => u._id === id || u.id === id);
  },
  async createUser(userData) {
    const db = loadDb();
    const newUser = { 
      ...userData, 
      _id: Date.now().toString(), 
      id: Date.now().toString(),
      role: userData.role || 'organizer'
    };
    db.users.push(newUser);
    saveDb(db);
    return newUser;
  },

  // Tournaments
  async findTournaments() {
    const db = loadDb();
    return db.tournaments;
  },
  async findTournamentById(id) {
    const db = loadDb();
    return db.tournaments.find(t => t._id === id || t.id === id);
  },
  async createTournament(data) {
    const db = loadDb();
    const newT = { ...data, _id: Date.now().toString(), id: Date.now().toString(), createdAt: new Date() };
    db.tournaments.push(newT);
    saveDb(db);
    return newT;
  },
  async updatePassword(email, newPassword) {
    const db = loadDb();
    const userIndex = db.users.findIndex(u => u.email === email);
    if (userIndex !== -1) {
      db.users[userIndex].password = newPassword;
      saveDb(db);
      return true;
    }
    return false;
  },

  // Tournament Update
  async updateTournamentById(id, updateData) {
    const db = loadDb();
    const index = db.tournaments.findIndex(t => t._id === id || t.id === id);
    if (index === -1) return null;
    
    const existing = db.tournaments[index];
    db.tournaments[index] = { 
      ...existing, 
      ...updateData, 
      _id: existing._id, 
      id: existing.id || existing._id,
      updatedAt: new Date()
    };
    saveDb(db);
    return db.tournaments[index];
  },

  // Tournament Delete
  async deleteTournamentById(id) {
    const db = loadDb();
    const index = db.tournaments.findIndex(t => t._id === id || t.id === id);
    if (index === -1) return false;
    db.tournaments.splice(index, 1);
    saveDb(db);
    return true;
  },

  // Turfs
  async findTurfs() {
    const db = loadDb();
    return db.turfs;
  },
  async findTurfById(id) {
    const db = loadDb();
    return db.turfs.find(t => t._id === id || t.id === id);
  },
  async findTurfsByAuthority(userId, email) {
    const db = loadDb();
    return db.turfs.filter(t => 
      t.authorityId === userId || 
      t.authorityEmail === email ||
      !t.authorityId // unassigned turfs can be managed
    );
  },
  async createTurf(data) {
    const db = loadDb();
    const newT = { ...data, _id: Date.now().toString(), id: Date.now().toString(), createdAt: new Date() };
    db.turfs.push(newT);
    saveDb(db);
    return newT;
  },

  // Authority Availability & Slots Management
  async createSlots(slotData) {
    const db = loadDb();
    const duration = Math.min(5, Math.max(1, parseInt(slotData.duration, 10) || 1));
    const dates = getConsecutiveDates(slotData.date, duration);
    const groupId = 'group_' + Date.now();
    const createdSlots = [];

    for (const d of dates) {
      const slot = {
        _id: 'slot_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
        id: 'slot_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
        fieldId: slotData.fieldId,
        date: d,
        startTime: slotData.startTime,
        endTime: slotData.endTime,
        durationDays: duration,
        groupId,
        createdAt: new Date().toISOString()
      };
      db.slots.push(slot);
      createdSlots.push(slot);
    }
    saveDb(db);
    return createdSlots;
  },

  async updateSlot(slotId, updateData) {
    const db = loadDb();
    const index = db.slots.findIndex(s => s._id === slotId || s.id === slotId);
    if (index === -1) return null;
    db.slots[index] = { ...db.slots[index], ...updateData };
    saveDb(db);
    return db.slots[index];
  },

  async deleteSlot(slotId) {
    const db = loadDb();
    const index = db.slots.findIndex(s => s._id === slotId || s.id === slotId);
    if (index === -1) return false;
    db.slots.splice(index, 1);
    saveDb(db);
    return true;
  },

  // Get Authority Dashboard View (Slots + Bookings for a Turf and Date)
  async findAvailabilityForAuthority(fieldId, date) {
    const db = loadDb();
    // 1. Slots defined for this date
    const customSlots = (db.slots || []).filter(s => s.fieldId === fieldId && s.date === date);
    const effectiveSlots = customSlots.length > 0 ? customSlots : DEFAULT_TIME_SLOTS.map((slot, index) => ({
      id: `${fieldId}_${date}_slot${index + 1}`,
      _id: `${fieldId}_${date}_slot${index + 1}`,
      fieldId,
      date,
      startTime: slot.startTime,
      endTime: slot.endTime,
      isDefault: true
    }));

    // 2. Active bookings touching this date
    const bookings = (db.bookings || []).filter(b => {
      if (b.fieldId !== fieldId) return false;
      const bDates = b.dates || (b.startDate ? getConsecutiveDates(b.startDate, b.duration || 1) : [b.date]);
      return bDates.includes(date);
    });

    // Check which slots have active bookings
    const slotsWithStatus = effectiveSlots.map(slot => {
      const activeBooking = bookings.find(b => 
        b.status !== 'REJECTED' && 
        b.status !== 'CANCELLED' && 
        (doTimesOverlap(slot.startTime, slot.endTime, b.startTime, b.endTime) || (b.slotId && (b.slotId === slot.id || b.slotId === slot._id)))
      );

      return {
        ...slot,
        isAvailable: !activeBooking,
        booking: activeBooking ? {
          id: activeBooking.id || activeBooking._id,
          status: activeBooking.status,
          tournamentName: activeBooking.tournamentName || 'Tournament Booking',
          organizerName: activeBooking.organizerName || 'Organizer',
          duration: activeBooking.duration || 1,
          startDate: activeBooking.startDate || activeBooking.date,
          endDate: activeBooking.endDate
        } : null
      };
    });

    return {
      fieldId,
      date,
      slots: slotsWithStatus,
      bookings: bookings.map(b => ({
        ...b,
        id: b.id || b._id
      }))
    };
  },

  // Slots for Organizer Tournament Creation (checks multi-day consecutive availability)
  async findSlotsByFieldAndDate(fieldId, date, durationDays = 1) {
    const db = loadDb();
    const duration = Math.min(5, Math.max(1, parseInt(durationDays, 10) || 1));
    const requiredDates = getConsecutiveDates(date, duration);

    // Active bookings for this field
    const activeBookings = (db.bookings || []).filter(
      b => b.fieldId === fieldId && b.status !== 'REJECTED' && b.status !== 'CANCELLED'
    );

    // Determine candidate slots for Day 1
    const customDaySlots = (db.slots || []).filter(s => s.fieldId === fieldId && s.date === date);
    const candidateSlots = customDaySlots.length > 0 ? customDaySlots : DEFAULT_TIME_SLOTS.map((slot, index) => ({
      id: `${fieldId}_${date}_slot${index + 1}`,
      _id: `${fieldId}_${date}_slot${index + 1}`,
      fieldId,
      date,
      startTime: slot.startTime,
      endTime: slot.endTime
    }));

    // A candidate slot is available if and only if across ALL requiredDates:
    // 1. It has no overlapping active booking on that date
    // 2. If duration > 1, all consecutive days must be unbooked during that time window
    return candidateSlots.map(slot => {
      let isAvailable = true;
      let unavailableDates = [];

      for (const d of requiredDates) {
        const hasConflict = activeBookings.some(b => {
          const bDates = b.dates || (b.startDate ? getConsecutiveDates(b.startDate, b.duration || 1) : [b.date]);
          if (!bDates.includes(d)) return false;
          return doTimesOverlap(slot.startTime, slot.endTime, b.startTime, b.endTime);
        });

        if (hasConflict) {
          isAvailable = false;
          unavailableDates.push(d);
        }
      }

      const slotId = slot.id || slot._id;
      return {
        id: slotId,
        _id: slotId,
        fieldId,
        date,
        startTime: slot.startTime,
        endTime: slot.endTime,
        duration,
        requiredDates,
        isAvailable,
        unavailableReason: isAvailable ? null : `Unavailable on: ${unavailableDates.join(', ')}`
      };
    });
  },

  // Bookings
  async findBookingsByUserId(userId) {
    const db = loadDb();
    return db.bookings.filter(b => b.userId === userId);
  },

  async findBookingsByFieldId(fieldId) {
    const db = loadDb();
    return db.bookings.filter(b => b.fieldId === fieldId).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  },

  async findBookingById(id) {
    const db = loadDb();
    return db.bookings.find(b => b._id === id || b.id === id);
  },

  // Create Booking with Multi-Day Double-Booking Protection
  async createBooking(data) {
    const db = loadDb();
    const duration = Math.min(5, Math.max(1, parseInt(data.duration, 10) || 1));
    const startDate = data.startDate || data.date;
    if (!startDate) {
      throw new Error('Start date is required for booking.');
    }
    const bookingDates = getConsecutiveDates(startDate, duration);
    const endDate = bookingDates[bookingDates.length - 1];

    // Find all active bookings for this field
    const activeBookings = (db.bookings || []).filter(
      b => b.fieldId === data.fieldId && b.status !== 'REJECTED' && b.status !== 'CANCELLED'
    );

    // Check for collision across all requested consecutive days
    for (const b of activeBookings) {
      const bDates = b.dates || (b.startDate ? getConsecutiveDates(b.startDate, b.duration || 1) : [b.date]);
      const commonDates = bookingDates.filter(d => bDates.includes(d));

      if (commonDates.length > 0) {
        const timeOverlap = doTimesOverlap(data.startTime, data.endTime, b.startTime, b.endTime) ||
                            (data.slotId && b.slotId && data.slotId === b.slotId);

        if (timeOverlap) {
          throw new Error(
            `Double-booking conflict: Turf is already booked/pending for this time (${b.startTime} - ${b.endTime}) on ${commonDates.join(', ')}.`
          );
        }
      }
    }

    const newB = { 
      ...data, 
      _id: Date.now().toString(), 
      id: Date.now().toString(), 
      startDate,
      endDate,
      duration,
      dates: bookingDates,
      status: data.status || 'PENDING', 
      createdAt: new Date().toISOString() 
    };

    db.bookings = db.bookings || [];
    db.bookings.push(newB);
    saveDb(db);
    return newB;
  },

  // Update Booking Status (PENDING -> APPROVED -> ONGOING -> COMPLETED -> CANCELLED / REJECTED)
  async updateBookingStatus(bookingId, status) {
    const validStatuses = ['PENDING', 'APPROVED', 'ONGOING', 'COMPLETED', 'CANCELLED', 'REJECTED'];
    const normalizedStatus = status.toUpperCase();
    if (!validStatuses.includes(normalizedStatus)) {
      throw new Error(`Invalid status: ${status}. Must be one of: ${validStatuses.join(', ')}`);
    }

    const db = loadDb();
    const booking = db.bookings.find(b => b._id === bookingId || b.id === bookingId);
    if (!booking) return null;

    booking.status = normalizedStatus;
    booking.updatedAt = new Date().toISOString();

    // If marked as COMPLETED, also update corresponding tournament if applicable
    if (normalizedStatus === 'COMPLETED' && booking.tournamentId) {
      const tourney = db.tournaments.find(t => t._id === booking.tournamentId || t.id === booking.tournamentId);
      if (tourney) {
        tourney.status = 'Completed';
        tourney.updatedAt = new Date().toISOString();
      }
    }

    saveDb(db);
    return booking;
  },

  // Review Eligibility Check
  async findReviewEligibility(userId, fieldId) {
    const db = loadDb();
    // User must have a COMPLETED booking for this field
    const completedBookings = (db.bookings || []).filter(
      b => b.fieldId === fieldId && b.userId === userId && b.status === 'COMPLETED'
    );

    if (completedBookings.length === 0) {
      return { 
        eligible: false, 
        message: 'Reviews are only allowed after your tournament booking at this venue is COMPLETED.' 
      };
    }

    // Check if there is at least one completed booking that has NOT been reviewed
    const unreviewedBooking = completedBookings.find(b => {
      const bookingId = b._id || b.id;
      return !(db.reviews || []).some(r => r.bookingId === bookingId && r.userId === userId);
    });

    if (!unreviewedBooking) {
      return { 
        eligible: false, 
        alreadyReviewed: true,
        message: 'You have already submitted a review for your completed booking at this venue.' 
      };
    }

    return {
      eligible: true,
      bookingId: unreviewedBooking._id || unreviewedBooking.id,
      tournamentId: unreviewedBooking.tournamentId,
      booking: unreviewedBooking
    };
  },

  // Reviews
  async findReviewsByFieldId(fieldId) {
    const db = loadDb();
    return (db.reviews || [])
      .filter(r => r.fieldId === fieldId)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  },

  async findReviewByUserAndBooking(userId, bookingId) {
    const db = loadDb();
    return (db.reviews || []).find(r => r.userId === userId && r.bookingId === bookingId);
  },

  async createReview(data) {
    const db = loadDb();
    const { fieldId, bookingId, userId, rating, comment, userName } = data;

    if (!bookingId) {
      throw new Error('A valid booking ID is required to submit a review.');
    }

    // Verify booking is COMPLETED
    const booking = (db.bookings || []).find(b => b._id === bookingId || b.id === bookingId);
    if (!booking) {
      throw new Error('Associated booking not found.');
    }
    if (booking.status !== 'COMPLETED') {
      throw new Error('Reviews are only allowed after a tournament booking has been COMPLETED.');
    }
    if (booking.userId !== userId) {
      throw new Error('You can only review bookings made from your own account.');
    }

    // Check for duplicate review
    const existing = (db.reviews || []).find(r => r.bookingId === bookingId && r.userId === userId);
    if (existing) {
      throw new Error('You have already submitted a review for this booking. Duplicate reviews are not allowed.');
    }

    const numericRating = Math.max(1, Math.min(5, parseFloat(rating) || 5));
    const newR = { 
      fieldId, 
      bookingId, 
      userId, 
      userName: userName || 'Organizer',
      tournamentId: booking.tournamentId || '',
      rating: numericRating, 
      comment: (comment || '').trim(), 
      _id: Date.now().toString(), 
      id: Date.now().toString(), 
      createdAt: new Date().toISOString() 
    };

    db.reviews = db.reviews || [];
    db.reviews.push(newR);

    // Update turf's average rating
    const turf = db.turfs.find(t => t._id === fieldId || t.id === fieldId);
    if (turf) {
      const fieldReviews = db.reviews.filter(r => r.fieldId === fieldId);
      const avg = fieldReviews.reduce((sum, r) => sum + r.rating, 0) / fieldReviews.length;
      turf.rating = parseFloat(avg.toFixed(1));
    }

    saveDb(db);
    return newR;
  }
};
