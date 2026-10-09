import { v4 as uuidv4 } from 'uuid'
import Tournament from '../models/Tournament.js'
import Team from '../models/Team.js'
import Player from '../models/Player.js'
import Match from '../models/Match.js'
import mongoose from 'mongoose'
import { mockDb } from '../services/mockDb.js'

// Helper to check if DB is connected
const isDbConnected = () => mongoose.connection.readyState === 1

// Create tournament
export const createTournament = async (req, res) => {
  try {
    const { name, startDate, sport, type } = req.body
    const organizerId = req.organizer.organizerId
    const creatorEmail = req.organizer.email
    
    if (!name || !startDate) {
      return res.status(400).json({ error: 'Tournament name and start date required' })
    }

    if (!isDbConnected()) {
      console.log('[Tournament] Using Mock DB for create')
      const newTournament = await mockDb.createTournament({
        ...req.body,
        organizerId,
        creatorEmail,
        sport: sport || type || 'General',
        status: 'Active'
      })
      return res.status(201).json({ message: 'Tournament created (Mock Mode)', tournament: newTournament })
    }
    
    const newTournament = await Tournament.create({
      ...req.body,
      organizerId,
      creatorEmail,
      sport: sport || type || 'General',
      status: 'Active'
    })
    
    res.status(201).json({ message: 'Tournament created successfully', tournament: newTournament })
  } catch (error) {
    console.error('Create tournament error:', error)
    res.status(500).json({ error: 'Failed to create tournament' })
  }
}

// Get all tournaments
export const getTournaments = async (req, res) => {
  try {
    let tournaments = []
    
    if (!isDbConnected()) {
      console.log('[Tournament] Using Mock DB for list')
      tournaments = await mockDb.findTournaments()
    } else {
      tournaments = await Tournament.find().populate('teams matches')
    }
    
    const visibleTournaments = tournaments.map(t => {
      const obj = t.toObject ? t.toObject() : t
      const id = obj._id || obj.id
      return {
        ...obj,
        id: id,
        canEdit: req.organizer && (obj.organizerId.toString() === req.organizer.organizerId),
        canView: true
      }
    }).filter(t => t.status === 'Active' || t.status === 'Launched' || t.canEdit)

    res.json(visibleTournaments)
  } catch (error) {
    console.error('Get tournaments error:', error)
    res.status(500).json({ error: 'Failed to fetch tournaments' })
  }
}

// Get tournament by ID
export const getTournamentById = async (req, res) => {
  try {
    const { id } = req.params
    let tournament = null

    if (!isDbConnected()) {
      tournament = await mockDb.findTournamentById(id)
    } else {
      tournament = await Tournament.findById(id).populate('teams matches')
    }
    
    if (!tournament) return res.status(404).json({ error: 'Tournament not found' })
    
    const tournamentObj = tournament.toObject ? tournament.toObject() : tournament
    tournamentObj.id = tournamentObj._id || tournamentObj.id
    
    if (req.organizer) {
      const orgId = (tournamentObj.organizerId || '').toString();
      const reqId = (req.organizer.organizerId || '').toString();
      tournamentObj.canEdit = orgId === reqId || tournamentObj.creatorEmail === req.organizer.email
    } else {
      tournamentObj.canEdit = false
    }
    
    res.json(tournamentObj)
  } catch (error) {
    console.error('Get tournament error:', error)
    res.status(500).json({ error: 'Failed to fetch tournament' })
  }
}

// Other methods can follow similar patterns or just return 500 in mock mode
export const updateTournament = async (req, res) => {
  try {
    const { id } = req.params;
    const organizerId = req.organizer.organizerId;
    const organizerEmail = req.organizer.email;

    if (!isDbConnected()) {
      console.log('[Tournament] Using Mock DB for update');
      const tournament = await mockDb.findTournamentById(id);
      
      if (!tournament) {
        return res.status(404).json({ error: 'Tournament not found' });
      }

      // Check ownership by ID or email
      if (tournament.organizerId !== organizerId && tournament.creatorEmail !== organizerEmail) {
        return res.status(403).json({ error: 'Not authorized to edit this tournament' });
      }

      const updated = await mockDb.updateTournamentById(id, req.body);
      return res.json({ message: 'Tournament updated (Mock Mode)', tournament: updated });
    }

    const tournament = await Tournament.findById(id);

    if (!tournament) {
      return res.status(404).json({ error: 'Tournament not found' });
    }

    if (tournament.organizerId.toString() !== organizerId && tournament.creatorEmail !== organizerEmail) {
      return res.status(403).json({ error: 'Not authorized to edit this tournament' });
    }

    const updatedTournament = await Tournament.findByIdAndUpdate(
      id,
      { $set: req.body },
      { new: true, runValidators: true }
    );

    res.json({ message: 'Tournament updated successfully', tournament: updatedTournament });
  } catch (error) {
    console.error('Update tournament error:', error);
    res.status(500).json({ error: 'Failed to update tournament' });
  }
}

export const deleteTournament = async (req, res) => {
  try {
    const { id } = req.params;
    const organizerId = req.organizer.organizerId;
    const organizerEmail = req.organizer.email;

    if (!isDbConnected()) {
      console.log('[Tournament] Using Mock DB for delete');
      const tournament = await mockDb.findTournamentById(id);
      
      if (!tournament) {
        return res.status(404).json({ error: 'Tournament not found' });
      }

      if (tournament.organizerId !== organizerId && tournament.creatorEmail !== organizerEmail) {
        return res.status(403).json({ error: 'Not authorized to delete this tournament' });
      }

      await mockDb.deleteTournamentById(id);
      return res.json({ message: 'Tournament deleted (Mock Mode)' });
    }

    const tournament = await Tournament.findById(id);

    if (!tournament) {
      return res.status(404).json({ error: 'Tournament not found' });
    }

    if (tournament.organizerId.toString() !== organizerId && tournament.creatorEmail !== organizerEmail) {
      return res.status(403).json({ error: 'Not authorized to delete this tournament' });
    }

    await Tournament.findByIdAndDelete(id);

    res.json({ message: 'Tournament deleted successfully' });
  } catch (error) {
    console.error('Delete tournament error:', error);
    res.status(500).json({ error: 'Failed to delete tournament' });
  }
}

export const getMyTournaments = async (req, res) => {
  try {
    const organizerId = req.organizer.organizerId
    let myTournaments = []

    if (!isDbConnected()) {
      const all = await mockDb.findTournaments()
      myTournaments = all.filter(t => t.organizerId === organizerId)
    } else {
      myTournaments = await Tournament.find({ organizerId }).populate('teams matches')
    }
    
    res.json(myTournaments)
  } catch (error) {
    console.error('Get my tournaments error:', error)
    res.status(500).json({ error: 'Failed to fetch tournaments' })
  }
}

export default {
  createTournament,
  getTournaments,
  getTournamentById,
  updateTournament,
  deleteTournament,
  getMyTournaments
}
