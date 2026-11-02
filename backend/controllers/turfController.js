import { mockDb, parseTimeToMinutes } from '../services/mockDb.js'

const text = value => typeof value === 'string' ? value.trim() : '';

const publicTurf = turf => ({
  id: turf.id || turf._id,
  _id: turf._id || turf.id,
  name: turf.name,
  description: turf.description || '',
  sportType: turf.sportType || '',
  location: turf.location || turf.address || '',
  address: turf.address || '',
  area: turf.area || '',
  city: turf.city || '',
  district: turf.district || '',
  contactNumber: turf.contactNumber || '',
  facilities: Array.isArray(turf.facilities) ? turf.facilities : [],
  photos: Array.isArray(turf.photos) ? turf.photos : [],
  coordinates: turf.coordinates || null,
  fields: Array.isArray(turf.fields)
    ? turf.fields.map(field => ({
        id: field.id || field._id,
        _id: field._id || field.id,
        name: field.name,
        sportType: field.sportType || '',
        surface: field.surface || '',
        dimensions: field.dimensions || '',
        description: field.description || ''
      }))
    : [],
  rating: turf.rating || 0,
  price: turf.price || turf.hourlyRate || 0
});

const authorityTurf = turf => ({
  ...publicTurf(turf),
  registrationStatus: turf.registrationStatus || 'pending',
  createdAt: turf.createdAt,
  updatedAt: turf.updatedAt
});

const validateTurf = body => {
  const required = ['name', 'sportType', 'address', 'area', 'city', 'district', 'contactNumber'];
  for (const key of required) {
    if (!text(body[key])) return `${key} is required.`;
  }
  const limits = { name: 120, sportType: 80, address: 300, area: 120, city: 120, district: 120, contactNumber: 40, description: 2000 };
  for (const [key, limit] of Object.entries(limits)) {
    if (text(body[key]).length > limit) return `${key} must be ${limit} characters or fewer.`;
  }
  const latitudeValue = body.coordinates?.latitude;
  const longitudeValue = body.coordinates?.longitude;
  if ((typeof latitudeValue !== 'number' && typeof latitudeValue !== 'string') ||
      (typeof longitudeValue !== 'number' && typeof longitudeValue !== 'string') ||
      (typeof latitudeValue === 'string' && !latitudeValue.trim()) ||
      (typeof longitudeValue === 'string' && !longitudeValue.trim())) {
    return 'Latitude and longitude are required numeric values.';
  }
  const latitude = Number(latitudeValue);
  const longitude = Number(longitudeValue);
  if (!Number.isFinite(latitude) || latitude < -90 || latitude > 90) {
    return 'Latitude must be a number between -90 and 90.';
  }
  if (!Number.isFinite(longitude) || longitude < -180 || longitude > 180) {
    return 'Longitude must be a number between -180 and 180.';
  }
  if (body.photos !== undefined && !Array.isArray(body.photos)) {
    return 'Photos must be a list of image URLs.';
  }
  if ((body.photos || []).some(photo => {
    try {
      return !['http:', 'https:'].includes(new URL(photo).protocol);
    } catch {
      return true;
    }
  })) {
    return 'Each photo must be a valid HTTP or HTTPS URL.';
  }
  if ((body.photos || []).length > 12) return 'A maximum of 12 photo URLs is allowed.';
  if ((body.photos || []).some(photo => String(photo).length > 2048)) return 'Photo URLs must be 2048 characters or fewer.';
  if (body.facilities !== undefined && !Array.isArray(body.facilities)) {
    return 'Facilities must be a list.';
  }
  if ((body.facilities || []).length > 30 || (body.facilities || []).some(item => text(item).length > 100)) {
    return 'Facilities must contain at most 30 items of 100 characters or fewer.';
  }
  return '';
};

const turfPayload = body => ({
  name: text(body.name),
  description: text(body.description),
  sportType: text(body.sportType),
  address: text(body.address),
  location: text(body.address),
  area: text(body.area),
  city: text(body.city),
  district: text(body.district),
  contactNumber: text(body.contactNumber),
  facilities: (body.facilities || []).map(text).filter(Boolean),
  photos: (body.photos || []).map(text).filter(Boolean),
  coordinates: {
    latitude: Number(body.coordinates.latitude),
    longitude: Number(body.coordinates.longitude)
  }
});

const validateField = body => {
  for (const key of ['name', 'sportType']) {
    if (!text(body[key])) return `${key} is required.`;
  }
  if (text(body.name).length > 100 || text(body.sportType).length > 80 ||
      text(body.surface).length > 100 || text(body.dimensions).length > 100 ||
      text(body.description).length > 1000) {
    return 'Field information exceeds the allowed length.';
  }
  return '';
};

const fieldPayload = body => ({
  name: text(body.name),
  sportType: text(body.sportType),
  surface: text(body.surface),
  dimensions: text(body.dimensions),
  description: text(body.description)
});

const authorityId = req => req.user.organizerId || req.user.userId || req.user.id;
const authenticatedUserId = req => req.user?.organizerId;
const bookingTimePattern = /^(0?[1-9]|1[0-2]):[0-5]\d\s?(AM|PM)$/i;
const isValidDate = value => {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00.000Z`);
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value;
};

const publicBooking = booking => ({
  id: booking.id || booking._id,
  turfId: booking.turfId,
  fieldId: booking.fieldId,
  tournamentId: booking.tournamentId,
  slotId: booking.slotId,
  date: booking.date || booking.startDate,
  startDate: booking.startDate,
  endDate: booking.endDate,
  duration: booking.duration,
  startTime: booking.startTime,
  endTime: booking.endTime,
  status: booking.status,
  createdAt: booking.createdAt
});

export const createBooking = async (req, res, next) => {
  const { turfId, fieldId, tournamentId, slotId } = req.body;
  const date = req.body.date || req.body.startDate;
  const duration = req.body.duration === undefined ? 1 : Number(req.body.duration);
  if (![turfId, fieldId, tournamentId, slotId].every(value => typeof value === 'string' && value.trim())) {
    return res.status(400).json({ error: 'Turf, field, tournament, and slot IDs are required.' });
  }
  if (!isValidDate(date)) {
    return res.status(400).json({ error: 'A valid booking date in YYYY-MM-DD format is required.' });
  }
  if (!Number.isInteger(duration) || duration < 1 || duration > 5) {
    return res.status(400).json({ error: 'Booking duration must be between 1 and 5 days.' });
  }
  if (!authenticatedUserId(req)) {
    return res.status(401).json({ error: 'Authenticated account ID is missing.' });
  }
  const submittedStart = req.body.startTime;
  const submittedEnd = req.body.endTime;
  if ((submittedStart !== undefined &&
       (typeof submittedStart !== 'string' || !bookingTimePattern.test(submittedStart))) ||
      (submittedEnd !== undefined &&
       (typeof submittedEnd !== 'string' || !bookingTimePattern.test(submittedEnd)))) {
    return res.status(400).json({ error: 'Booking times must use the 12-hour HH:MM AM/PM format.' });
  }

  try {
    const tournament = await mockDb.findTournamentById(tournamentId);
    if (!tournament) return res.status(404).json({ error: 'Tournament not found.' });
    const ownerMatches = String(tournament.organizerId || '') === String(authenticatedUserId(req)) ||
      (!tournament.organizerId && req.user.email && tournament.creatorEmail &&
        String(tournament.creatorEmail).toLowerCase() === String(req.user.email).toLowerCase());
    if (!ownerMatches) {
      return res.status(403).json({ error: 'You may only book a turf for your own tournament.' });
    }

    const relationship = await mockDb.findBookableTurfField(turfId, fieldId);
    if (!relationship) {
      return res.status(404).json({ error: 'The requested field does not belong to an available turf.' });
    }

    const slots = await mockDb.findSlotsByFieldAndDate(fieldId, date, duration);
    const slot = slots.find(item => (item.id === slotId || item._id === slotId));
    if (!slot) return res.status(404).json({ error: 'The selected slot is not available for this field and date.' });
    if (!bookingTimePattern.test(slot.startTime || '') || !bookingTimePattern.test(slot.endTime || '')) {
      return res.status(400).json({ error: 'The selected slot has invalid time values.' });
    }

    if ((submittedStart !== undefined &&
         submittedStart.toUpperCase().replace(/\s/g, '') !== slot.startTime.toUpperCase().replace(/\s/g, '')) ||
        (submittedEnd !== undefined &&
         submittedEnd.toUpperCase().replace(/\s/g, '') !== slot.endTime.toUpperCase().replace(/\s/g, '')) ||
        parseTimeToMinutes(slot.startTime) >= parseTimeToMinutes(slot.endTime)) {
      return res.status(400).json({ error: 'Booking times must match the selected slot.' });
    }
    if (!slot.isAvailable) return res.status(409).json({ error: 'The selected slot is no longer available.' });

    const booking = await mockDb.createBooking({
      userId: authenticatedUserId(req),
      turfId,
      fieldId,
      tournamentId,
      slotId,
      date,
      duration,
      startTime: slot.startTime,
      endTime: slot.endTime
    });
    return res.status(201).json(publicBooking(booking));
  } catch (error) {
    if (error.message?.startsWith('Double-booking conflict:')) {
      return res.status(409).json({ error: error.message });
    }
    return next(error);
  }
};

export const getUserBookings = async (req, res, next) => {
  const userId = authenticatedUserId(req);
  if (!userId) return res.status(401).json({ error: 'Authenticated account ID is missing.' });
  if (req.params.userId !== String(userId)) {
    return res.status(403).json({ error: 'You may only access your own booking history.' });
  }

  try {
    const bookings = await mockDb.findBookingsByUserId(String(userId));
    return res.json(bookings.map(publicBooking));
  } catch (error) {
    return next(error);
  }
};

export const listPublicTurfs = async (req, res, next) => {
  try {
    const turfs = await mockDb.findTurfs();
    res.json(turfs
      .filter(turf => !turf.deletedAt && (!turf.registrationStatus || turf.registrationStatus === 'active'))
      .map(publicTurf));
  } catch (error) {
    next(error);
  }
};

export const getPublicTurf = async (req, res, next) => {
  try {
    const turf = await mockDb.findTurfById(req.params.id);
    if (!turf || turf.deletedAt || (turf.registrationStatus && turf.registrationStatus !== 'active')) {
      return res.status(404).json({ error: 'Turf not found.' });
    }
    return res.json(publicTurf(turf));
  } catch (error) {
    next(error);
  }
};

export const listMyTurfs = async (req, res, next) => {
  try {
    const turfs = await mockDb.findTurfsByAuthority(authorityId(req));
    res.json(turfs.map(authorityTurf));
  } catch (error) {
    next(error);
  }
};

export const getMyTurf = (req, res) => res.json(authorityTurf(req.turf));

export const createTurf = async (req, res, next) => {
  const validationError = validateTurf(req.body);
  if (validationError) return res.status(400).json({ error: validationError });

  try {
    const turf = await mockDb.createTurf(turfPayload(req.body), authorityId(req));
    return res.status(201).json(authorityTurf(turf));
  } catch (error) {
    next(error);
  }
};

export const updateTurf = async (req, res, next) => {
  const validationError = validateTurf(req.body);
  if (validationError) return res.status(400).json({ error: validationError });

  try {
    const turf = await mockDb.updateTurfByAuthority(req.params.turfId, authorityId(req), turfPayload(req.body));
    if (!turf) return res.status(404).json({ error: 'Turf not found.' });
    return res.json(authorityTurf(turf));
  } catch (error) {
    next(error);
  }
};

export const deleteTurf = async (req, res, next) => {
  try {
    const result = await mockDb.deleteTurfByAuthority(req.params.turfId, authorityId(req));
    if (!result.turf) return res.status(404).json({ error: 'Turf not found.' });
    if (result.conflict) {
      return res.status(409).json({ error: 'This turf has booking history and cannot be deleted.' });
    }
    return res.json({ message: 'Turf removed from active management.' });
  } catch (error) {
    next(error);
  }
};

export const createField = async (req, res, next) => {
  const validationError = validateField(req.body);
  if (validationError) return res.status(400).json({ error: validationError });
  if ((req.turf.fields || []).some(field => text(field.name).toLowerCase() === text(req.body.name).toLowerCase())) {
    return res.status(409).json({ error: 'A field with this name already exists on the turf.' });
  }
  try {
    const field = await mockDb.addFieldToTurf(req.params.turfId, authorityId(req), fieldPayload(req.body));
    if (!field) return res.status(404).json({ error: 'Turf not found.' });
    return res.status(201).json(field);
  } catch (error) {
    next(error);
  }
};

export const updateField = async (req, res, next) => {
  const validationError = validateField(req.body);
  if (validationError) return res.status(400).json({ error: validationError });
  if ((req.turf.fields || []).some(field =>
    (field.id !== req.params.fieldId && field._id !== req.params.fieldId) &&
    text(field.name).toLowerCase() === text(req.body.name).toLowerCase()
  )) {
    return res.status(409).json({ error: 'A field with this name already exists on the turf.' });
  }
  try {
    const result = await mockDb.updateFieldOnTurf(
      req.params.turfId,
      req.params.fieldId,
      authorityId(req),
      fieldPayload(req.body)
    );
    if (!result.turf || !result.field) return res.status(404).json({ error: 'Field not found.' });
    return res.json(result.field);
  } catch (error) {
    next(error);
  }
};

export const deleteField = async (req, res, next) => {
  try {
    const result = await mockDb.deleteFieldFromTurf(
      req.params.turfId,
      req.params.fieldId,
      authorityId(req)
    );
    if (!result.turf || (!result.deleted && !result.conflict)) {
      return res.status(404).json({ error: 'Field not found.' });
    }
    if (result.conflict) {
      return res.status(409).json({ error: 'This field has slot or booking history and cannot be deleted.' });
    }
    return res.json({ message: 'Field deleted.' });
  } catch (error) {
    next(error);
  }
};
