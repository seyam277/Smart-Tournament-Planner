import mongoose from 'mongoose'

const tournamentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  sport: { type: String, required: true },
  location: String,
  startDate: String,
  endDate: String,
  format: { type: String, default: 'League' },
  rules: String,
  organizerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  creatorEmail: String,
  status: { type: String, enum: ['Draft', 'Active', 'Completed'], default: 'Draft' },
  budget: {
    total: Number,
    food: Number,
    transport: Number,
    venue: Number,
    equipment: Number,
    other: Number
  },
  prizeMoney: {
    first: Number,
    second: Number,
    third: Number,
    showToPublic: { type: Boolean, default: true }
  },
  maxPlayersPerTeam: { type: Number, default: 11 },
  players: [{
    id: String,
    name: String,
    role: String,
    team: String,
    jerseyNumber: String
  }],
  teams: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Team' }],
  matches: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Match' }]
}, { timestamps: true })

const Tournament = mongoose.model('Tournament', tournamentSchema)
export default Tournament
